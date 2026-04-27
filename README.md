PlaceFinder AI
An intelligent full-stack travel discovery platform powered by Google Gemini AI, built as a final year project for BSc Computer Science at Cardiff Metropolitan University.
What it does

Search for places using natural language, voice, or image upload
AI-powered travel assistant chat (Google Gemini 2.0 Flash)
Interactive map with real-time results (Leaflet + OpenStreetMap)
Personalised recommendations from a machine learning model built in Google Colab
Real-time weather for any location
Bookmark places and build multi-day itineraries
Subscription payment system (Stripe)

Tech Stack

Frontend: React 18, TypeScript, Vite, Tailwind CSS
Backend: FastAPI, Python 3.11, PostgreSQL + PostGIS
AI: Google Gemini 2.0 Flash
ML: scikit-learn, pandas (TF-IDF + cosine similarity, trained in Google Colab)
Maps: Leaflet + Nominatim
Payments: Stripe Checkout

How to Run Locally
Backend:
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
Frontend:
cd frontend
npm install
npm run dev
Environment Variables needed (.env)

GEMINI_API_KEY
OPENWEATHER_API_KEY
STRIPE_SECRET_KEY
DATABASE_URL
SECRET_KEY

Testing
124 automated API tests built in Postman. Import the collection from /tests/postman/ and run with Collection Runner.
ML Pipeline
The recommendation engine was trained in Google Colab using TF-IDF vectorisation and cosine similarity scoring. The notebook is in /notebooks/
