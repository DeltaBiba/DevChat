from fastapi import FastAPI
import uvicorn

app = FastAPI(title="Server")

@app.get("/")
async def root():
    return {"message": "Server is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3000)