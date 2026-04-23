import os
import stripe  # ← was missing
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
DEV_MODE = os.getenv("DEV_MODE", "true").lower() == "true"

router = APIRouter()


@router.post("/create-checkout-session")
async def create_checkout_session(request: Request):
    try:
        body = await request.json()
        price_id = body.get("priceId")

        if not price_id or not isinstance(price_id, str):
            return JSONResponse({"error": "Invalid price ID."}, status_code=400)

        app_url = os.getenv("APP_URL", "http://localhost:5173")

        # Dev mode: skip real Stripe call
        if DEV_MODE or price_id.startswith("price_demo") or "XXX" in price_id:
            plan_key = "pro"
            if "starter" in price_id.lower() or "free" in price_id.lower():
                plan_key = "starter"
            elif "enterprise" in price_id.lower():
                plan_key = "enterprise"
            mock_url = f"{app_url}/checkout?plan={plan_key}&session_id=dev_mock_session"
            return JSONResponse({"url": mock_url})

        session = stripe.checkout.Session.create(
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=app_url + "/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=app_url + "/#pricing",
        )

        return JSONResponse({"url": session.url})

    except stripe.StripeError as e:
        return JSONResponse({"error": e.user_message}, status_code=400)
    except Exception:
        return JSONResponse({"error": "Internal server error."}, status_code=500)
