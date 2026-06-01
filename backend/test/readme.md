# terminal 1 — start the server

cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000

# terminal 2 — run tests

cd backend

# use test_drawing.png by default

python test/test.py

# specify image

python test.py path/to/my_drawing.png
