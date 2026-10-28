import io, os
from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from PIL import Image, ImageOps
from dotenv import load_dotenv
from .database import init_db, add_memory, get_memories, delete_memory, add_task, get_tasks, set_task_done
from .agent import generate_reply, classify_tool

load_dotenv()
app = FastAPI(title="JARVIS AI API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=[os.getenv("FRONTEND_ORIGIN","http://localhost:5173"),"http://127.0.0.1:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
def startup():
    init_db()

class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=8000)
class MemoryRequest(BaseModel):
    content: str = Field(min_length=1, max_length=2000)
class TaskRequest(BaseModel):
    title: str = Field(min_length=1, max_length=300)
class DoneRequest(BaseModel):
    done: bool

@app.get("/api/health")
def health():
    return {"status":"online","name":"JARVIS AI","mode":"text-only starter"}

@app.post("/api/chat")
def chat(req: ChatRequest):
    return {"reply":generate_reply(req.message, get_memories()),"tool":classify_tool(req.message)}

@app.get("/api/memories")
def memories_list():
    return {"memories":get_memories()}
@app.post("/api/memories")
def memories_create(req: MemoryRequest):
    content=req.content.strip()
    return {"id":add_memory(content),"content":content}
@app.delete("/api/memories/{memory_id}")
def memories_delete(memory_id:int):
    if not delete_memory(memory_id): raise HTTPException(404,"Memory not found")
    return {"deleted":True}

@app.get("/api/tasks")
def tasks_list():
    return {"tasks":get_tasks()}
@app.post("/api/tasks")
def tasks_create(req:TaskRequest):
    return add_task(req.title.strip())
@app.patch("/api/tasks/{task_id}")
def tasks_update(task_id:int, req:DoneRequest):
    if not set_task_done(task_id,req.done): raise HTTPException(404,"Task not found")
    return {"updated":True}

@app.post("/api/images/collage")
async def collage(files:List[UploadFile]=File(...)):
    if len(files)<2: raise HTTPException(400,"Upload at least two images.")
    images=[]
    for file in files[:12]:
        try: images.append(ImageOps.fit(Image.open(io.BytesIO(await file.read())).convert("RGB"),(400,300)))
        except Exception: raise HTTPException(400,f"{file.filename} is not a supported image.")
    cols=2; rows=(len(images)+1)//2
    canvas=Image.new("RGB",(cols*400,rows*300),"#111827")
    for i,img in enumerate(images): canvas.paste(img,((i%cols)*400,(i//cols)*300))
    out=io.BytesIO(); canvas.save(out,format="PNG"); out.seek(0)
    return StreamingResponse(out,media_type="image/png",headers={"Content-Disposition":'attachment; filename="jarvis-collage.png"'})

@app.post("/api/images/remove-background")
async def remove_background(file:UploadFile=File(...)):
    data=await file.read()
    try:
        from rembg import remove
    except ImportError:
        raise HTTPException(501,"Background removal is not installed. In the backend environment run: pip install rembg")
    try:
        result=remove(data); img=Image.open(io.BytesIO(result)).convert("RGBA")
        out=io.BytesIO(); img.save(out,format="PNG"); out.seek(0)
        return StreamingResponse(out,media_type="image/png",headers={"Content-Disposition":'attachment; filename="jarvis-no-background.png"'})
    except Exception as exc:
        raise HTTPException(400,f"Could not process image: {exc}")
