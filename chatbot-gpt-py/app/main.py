import os
import uvicorn

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.typings import UserQuery
from app.chain.composite_chain import CompositeChain

load_dotenv()
composite_chain = CompositeChain().chain

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_ORIGIN")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
async def root():
    return "hello"

@app.post("/api/message")
async def handleMessage(query: UserQuery):
    """
    This method handles user's messages
    """
    try:
        query = query.message
        res = composite_chain.invoke({"question": query})
        return res
    except Exception as e:
        print(f"[Error] {e}")
        raise e

if __name__ == "__main__":
    uvicorn.run(app, port=3001)
