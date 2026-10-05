"""Backend API for the Tone mobile app.

This keeps the API behavior from the desktop tone-app service while exposing
only the routes required by the Expo/React Native client.

Run from this directory with:
    py -3 -m uvicorn app:app --host 0.0.0.0 --port 8000
"""

import json
import logging
import os
import urllib.error
import urllib.request
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from groq import (
    APIConnectionError,
    APIError,
    APITimeoutError,
    AsyncGroq,
    AuthenticationError,
    BadRequestError,
)
from pydantic import BaseModel, Field

load_dotenv(Path(__file__).with_name('.env'))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('tone-mobile')

app = FastAPI(title='Tone mobile API')
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)

SUPABASE_URL = os.environ.get('SUPABASE_URL', '').rstrip('/')
SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY', '')
SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '').strip()
PLACEHOLDER_SERVICE_ROLE_KEYS = {
    '', 'your_service_role_key', 'placeholder', 'changeme', 'replace_me', 'service_role_key'
}

MODEL = os.environ.get('GROQ_MODEL', 'openai/gpt-oss-20b')
MAX_RESPONSE_TOKENS = 2048
MAX_INPUT_CHARS = 6000
GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '').strip()

client = (
    AsyncGroq(api_key=GROQ_API_KEY, timeout=15.0, max_retries=1)
    if GROQ_API_KEY
    else None
)

TONE_GUIDES = {
    'formal': 'Formal: precise word choice, no contractions, complete sentences, respectful distance.',
    'friendly': 'Friendly: warm and approachable, contractions welcome, still clear and easy to act on.',
    'confident': "Confident: direct claims, active voice, no hedging words like 'maybe' or 'I think'.",
    'academic': 'Academic: measured and evidence-minded, third person where natural, avoids slang.',
    'persuasive': 'Persuasive: leads with the strongest point, clear benefit to the reader, calls to action.',
    'empathetic': "Empathetic: acknowledges the reader's situation or feelings before making the ask.",
    'concise': 'Concise: shortest version that keeps every fact; cut filler and throat-clearing.',
    'casual': 'Casual: relaxed, conversational, like texting a friend — still readable.',
    'diplomatic': 'Diplomatic: neutral and even-handed, avoids assigning blame, looks for common ground, careful phrasing around disagreement.',
    'enthusiastic': 'Enthusiastic: high energy, genuinely excited, forward-looking — without becoming unfocused or losing the actual point.',
    'apologetic': 'Apologetic: sincerely owns the mistake with no excuses upfront, then says what happens next to make it right.',
    'flirty': (
        'Flirty (PG): warm, playful, a little teasing and charming — light compliments and gentle banter. '
        'Must stay tasteful and PG: no sexual language, no descriptions of bodies or physical acts, nothing '
        'explicit. Think confident and cute, not raunchy.'
    ),
}

USE_CASES = {
    'boss_email': {'label': 'Email to boss', 'default_tone': 'formal', 'context': "The reader is the writer's direct manager or boss at work. The writer wants to come across as professional, competent, and respectful of the reader's time."},
    'class_essay': {'label': 'Class essay', 'default_tone': 'academic', 'context': 'This is being submitted for a class assignment, likely English or a humanities course. The reader is a teacher or professor grading for clarity of argument and command of the material.'},
    'job_application': {'label': 'Job application', 'default_tone': 'confident', 'context': 'The reader is a hiring manager or recruiter deciding whether to move the writer forward in a hiring process. The writer wants to demonstrate real capability without sounding arrogant.'},
    'social_post': {'label': 'Social post', 'default_tone': 'casual', 'context': 'This will be posted publicly on social media for friends, followers, or a general online audience to see.'},
    'text_message': {'label': 'Text message', 'default_tone': 'friendly', 'context': 'This is a quick message to someone the writer already knows well, sent by text. Brevity matters more than polish.'},
    'cover_letter': {'label': 'Cover letter', 'default_tone': 'persuasive', 'context': 'This accompanies a job application. The reader is deciding whether to interview the writer, so it needs to make a clear, compelling case.'},
    'partner_text': {'label': 'Text a partner', 'default_tone': 'flirty', 'context': "The reader is the writer's girlfriend, boyfriend, or partner. The writer wants to sound warm and a little flirtatious, while staying tasteful and PG."},
    'friend_apology': {'label': 'Apology to a friend', 'default_tone': 'apologetic', 'context': 'The reader is a close friend the writer has upset or let down. The writer wants to genuinely repair the relationship, not just check a box.'},
}

SYSTEM_PROMPT = (
    'You rewrite text to match a requested tone. Before writing, think through: '
    'who is likely reading this and what is their relationship to the writer '
    '(e.g. a boss, a professor, a stranger); what outcome the writer wants from '
    'this piece of writing; and what the requested tone implies about word '
    'choice, sentence length, formality, and structure for that specific reader '
    'and outcome. Then write the rewrite so it serves that reader and outcome — '
    'not just a generic version of the tone.\n\n'
    'Write like an actual person, not like an AI assistant. Specifically:\n'
    "- Never open with stock phrases like 'I hope this message finds you well', "
    "'I wanted to reach out', or 'I hope you're doing well'.\n"
    "- Don't use corporate transition words: 'furthermore', 'moreover', "
    "'additionally', 'in conclusion'. Real people just start the next sentence.\n"
    '- Avoid em dashes and semicolons unless the target tone specifically calls '
    'for a formal, literary register. Most real writing uses periods and commas.\n'
    "- Vary sentence length the way people actually do — mix short and long, "
    "don't make every sentence the same balanced medium length.\n"
    "- Avoid triplets and neatly parallel lists ('clear, concise, and "
    "effective') — real writing is rarely that tidy.\n"
    "- Don't add a wrap-up sentence that just restates what the message "
    'already said. End when the point is made.\n'
    '- For casual tones (casual, friendly, flirty, text message contexts), '
    "contractions, sentence fragments, and imperfect rhythm are good — that's "
    'how people actually text and talk.\n\n'
    "Preserve the writer's meaning, facts, and intent exactly. Do not add new "
    'claims, invent details, or change the point of the message. In your final '
    'answer, return only the rewritten text — no preamble, no quotation marks, '
    'no notes about what you changed or why.'
)


class TransformRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=MAX_INPUT_CHARS)
    tone: str
    use_case: str | None = None


@app.get('/')
async def health():
    return {'status': 'ok', 'service': 'tone-mobile-api'}


@app.post('/api/account/delete')
async def delete_account(request: Request):
    if not SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_ROLE_KEY.lower() in {key.lower() for key in PLACEHOLDER_SERVICE_ROLE_KEYS}:
        return JSONResponse({'error': 'Account deletion is not configured on the backend.'}, status_code=503)

    authorization = request.headers.get('authorization', '')
    if not authorization.lower().startswith('bearer '):
        return JSONResponse({'error': 'You must be signed in to delete your account.'}, status_code=401)

    user_request = urllib.request.Request(
        f'{SUPABASE_URL}/auth/v1/user',
        headers={'apikey': SUPABASE_ANON_KEY, 'Authorization': authorization},
    )
    try:
        with urllib.request.urlopen(user_request, timeout=10) as response:
            user = json.loads(response.read())
    except (urllib.error.HTTPError, urllib.error.URLError, json.JSONDecodeError):
        return JSONResponse({'error': 'Your session is invalid or expired. Please log in again.'}, status_code=401)

    user_id = user.get('id')
    if not user_id:
        return JSONResponse({'error': 'Could not identify the signed-in account.'}, status_code=401)

    delete_request = urllib.request.Request(
        f'{SUPABASE_URL}/auth/v1/admin/users/{user_id}',
        method='DELETE',
        headers={'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': f'Bearer {SUPABASE_SERVICE_ROLE_KEY}'},
    )
    try:
        with urllib.request.urlopen(delete_request, timeout=10):
            pass
    except (urllib.error.HTTPError, urllib.error.URLError):
        logger.exception('Supabase account deletion failed')
        return JSONResponse({'error': 'Account deletion failed. Please try again.'}, status_code=502)

    return {'deleted': True}


@app.post('/api/transform')
async def transform(payload: TransformRequest):
    if client is None:
        return JSONResponse({'error': 'The backend is missing GROQ_API_KEY.'}, status_code=503)

    text = payload.text.strip()
    tone = payload.tone.strip().lower()
    use_case = (payload.use_case or '').strip().lower() or None

    if not text:
        return JSONResponse({'error': 'Add some text to transform.'}, status_code=400)
    if tone not in TONE_GUIDES:
        return JSONResponse({'error': f"Unknown tone '{tone}'."}, status_code=400)
    if use_case is not None and use_case not in USE_CASES:
        return JSONResponse({'error': f"Unknown use case '{use_case}'."}, status_code=400)

    prompt_parts = [f'Target tone — {tone}.', f'Tone guide: {TONE_GUIDES[tone]}']
    if use_case is not None:
        prompt_parts.append(f"Use case context: {USE_CASES[use_case]['context']}")
    prompt_parts.append(f'\nRewrite the following text in that tone:\n\n{text}')

    try:
        response = await client.chat.completions.create(
            model=MODEL,
            max_completion_tokens=MAX_RESPONSE_TOKENS,
            reasoning_format='hidden',
            reasoning_effort='medium',
            messages=[
                {'role': 'system', 'content': SYSTEM_PROMPT},
                {'role': 'user', 'content': '\n'.join(prompt_parts)},
            ],
        )
        result_text = (response.choices[0].message.content or '').strip()
        if not result_text:
            return JSONResponse({'error': 'The tone engine returned an empty result.'}, status_code=502)
        return {'result': result_text, 'tone': tone, 'use_case': use_case}
    except AuthenticationError:
        logger.error('Groq authentication failed')
        return JSONResponse({'error': 'The tone engine rejected the request. Check GROQ_API_KEY.'}, status_code=502)
    except BadRequestError as exc:
        logger.error('Groq bad request: %s', exc)
        return JSONResponse({'error': f"The model '{MODEL}' may not support this request."}, status_code=502)
    except APITimeoutError:
        return JSONResponse({'error': 'The tone engine took too long to respond. Try again.'}, status_code=504)
    except APIConnectionError:
        return JSONResponse({'error': 'Could not reach the tone engine. Check the backend internet connection.'}, status_code=502)
    except APIError as exc:
        logger.error('Groq API error: %s', exc)
        return JSONResponse({'error': 'The tone engine is unavailable right now. Try again shortly.'}, status_code=502)
    except Exception:
        logger.exception('Unexpected error during transform')
        return JSONResponse({'error': 'Something went wrong on the backend.'}, status_code=500)


if __name__ == '__main__':
    import uvicorn

    uvicorn.run(app, host='0.0.0.0', port=int(os.environ.get('PORT', '8001')))
