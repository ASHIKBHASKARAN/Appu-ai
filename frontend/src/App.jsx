import { useEffect, useState } from "react";
import {
  Bot,
  LayoutDashboard,
  MessageSquare,
  ImagePlus,
  BrainCircuit,
  ShieldCheck,
  Check,
  Send,
  Upload,
  Sparkles,
  Trash2,
  Plus,
  ChevronRight,
} from "lucide-react";

const API = "http://127.0.0.1:8000";

export default function App() {
  const [page, S] = useState("Overview");
  const [online, O] = useState(false);
  const [messages, M] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm Appu AI, your personal AI assistant. What would you like to work on today?",
    },
  ]);
  const [input, I] = useState("");
  const [busy, B] = useState(false);
  const [memories, MM] = useState([]);
  const [tasks, TT] = useState([]);
  const [memoryInput, MI] = useState("");
  const [taskInput, TI] = useState("");
  const [files, F] = useState([]);
  const [status, ST] = useState("");
  const [result, R] = useState("");

  async function refresh() {
    try {
      const [h, m, t] = await Promise.all([
        fetch(API + "/api/health"),
        fetch(API + "/api/memories"),
        fetch(API + "/api/tasks"),
      ]);
      O(h.ok);
      MM((await m.json()).memories);
      TT((await t.json()).tasks);
    } catch {
      O(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function send(text = input) {
    text = text.trim();
    if (!text || busy) return;

    M((a) => [...a, { role: "user", content: text }]);
    I("");
    B(true);

    try {
      const r = await fetch(API + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const d = await r.json();
      M((a) => [
        ...a,
        { role: "assistant", content: d.reply, tool: d.tool },
      ]);
    } catch {
      M((a) => [
        ...a,
        {
          role: "assistant",
          content:
            "Backend not reachable. Start the FastAPI server and try again.",
        },
      ]);
    } finally {
      B(false);
    }
  }

  async function saveMemory(e) {
    e.preventDefault();
    if (!memoryInput.trim()) return;

    await fetch(API + "/api/memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: memoryInput }),
    });

    MI("");
    refresh();
  }

  async function addTask(e) {
    e.preventDefault();
    if (!taskInput.trim()) return;

    await fetch(API + "/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: taskInput }),
    });

    TI("");
    refresh();
  }

  async function toggle(t) {
    await fetch(API + "/api/tasks/" + t.id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !t.done }),
    });
    refresh();
  }

  async function process(url) {
    if (!files.length) {
      ST("Choose image files first.");
      return;
    }

    if (url.includes("collage") && files.length < 2) {
      ST("Choose at least two images.");
      return;
    }

    ST("Processing…");
    R("");

    const fd = new FormData();

    if (url.includes("collage")) {
      files.forEach((f) => fd.append("files", f));
    } else {
      fd.append("file", files[0]);
    }

    try {
      const r = await fetch(API + url, {
        method: "POST",
        body: fd,
      });

      if (!r.ok) {
        const d = await r.json();
        throw Error(d.detail || "Processing failed");
      }

      R(URL.createObjectURL(await r.blob()));
      ST("Your image is ready.");
    } catch (e) {
      ST(e.message);
    }
  }

  const nav = [
    ["Overview", LayoutDashboard],
    ["AI Chat", MessageSquare],
    ["Image Studio", ImagePlus],
    ["Decision Center", BrainCircuit],
    ["Memory Vault", ShieldCheck],
    ["Task Manager", Check],
  ];

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">
            <Bot />
          </div>
          <div>
            <b>
              Appu <span>AI</span>
            </b>
            <small>PERSONAL INTELLIGENCE</small>
          </div>
        </div>

        <label className="label">WORKSPACE</label>

        {nav.map(([n, Icon]) => (
          <button
            className={"nav " + (page === n ? "active" : "")}
            onClick={() => S(n)}
            key={n}
          >
            <Icon size={17} />
            {n}
            {page === n && <ChevronRight className="right" size={15} />}
          </button>
        ))}

        <div className="sidebottom">
          <div className="status">
            <i className={online ? "" : "off"} />
            <div>
              <b>{online ? "System online" : "Backend offline"}</b>
              <small>
                {online ? "Core systems ready" : "Start backend to connect"}
              </small>
            </div>
          </div>
          <small>APPU AI · PERSONAL ASSISTANT</small>
        </div>
      </aside>

      <main>
        <header>
          <span>
            Workspace　/　<b>{page}</b>
          </span>
          <div className="pill">
            <i className={online ? "" : "off"} />
            {online ? "SYSTEM READY" : "WAITING FOR API"}
          </div>
        </header>

        <div className="content">
          {page === "Overview" && (
            <>
              <section className="hero">
                <div className="eyebrow">
                  ◉ PERSONAL INTELLIGENCE SYSTEM
                </div>
                <h1>
                  Your ideas.
                  <br />
                  <span>Amplified.</span>
                </h1>
                <p>
                  One intelligent workspace to think clearly, create freely,
                  and get things done.
                </p>
                <button className="primary" onClick={() => S("AI Chat")}>
                  Talk to Appu AI <ChevronRight size={16} />
                </button>
                <div className="hero-foot">
                  <i className={online ? "" : "off"} />
                  {online ? "CORE ONLINE" : "BACKEND NOT CONNECTED"}　 ·　
                  Permission-aware tools
                </div>
                <div className="orb">
                  <div>
                    <Bot size={48} />
                  </div>
                </div>
              </section>

              <div className="section-title">
                <div>
                  <h2>Command center</h2>
                  <p>Choose a capability to get started.</p>
                </div>
                <small>YOUR WORKSPACE</small>
              </div>

              <div className="cards">
                {[
                  ["AI Chat", "Ask questions and explore ideas.", MessageSquare],
                  [
                    "Image Studio",
                    "Create collages and remove backgrounds.",
                    ImagePlus,
                  ],
                  [
                    "Decision Center",
                    "Compare choices and trade-offs.",
                    BrainCircuit,
                  ],
                  [
                    "Memory Vault",
                    "Save context for future chats.",
                    ShieldCheck,
                  ],
                ].map(([t, d, Icon]) => (
                  <button
                    className="card"
                    key={t}
                    onClick={() => S(t)}
                  >
                    <div className="cardicon">
                      <Icon />
                    </div>
                    <h3>{t}</h3>
                    <p>{d}</p>
                    <span>Open workspace　›</span>
                  </button>
                ))}
              </div>

              <div className="twocol">
                <div className="panel">
                  <h3>Quick commands</h3>
                  {[
                    "Help me choose a project for my resume",
                    "Explain APIs in simple terms",
                    "Plan my next study session",
                  ].map((q) => (
                    <button
                      className="quick"
                      onClick={() => {
                        S("AI Chat");
                        send(q);
                      }}
                      key={q}
                    >
                      ✧　{q}　›
                    </button>
                  ))}
                </div>

                <div className="panel">
                  <h3>Task snapshot</h3>
                  <h1>
                    {tasks.filter((t) => !t.done).length}
                    <small> open tasks</small>
                  </h1>
                  <p>
                    {tasks.length
                      ? `${tasks.filter((t) => t.done).length} of ${
                          tasks.length
                        } completed`
                      : "Add your first task to track progress."}
                  </p>
                </div>
              </div>
            </>
          )}

          {page === "AI Chat" && (
            <>
              <div className="heading">
                <div className="eyebrow">✧ YOUR AI PARTNER</div>
                <h1>Let's get things done.</h1>
                <p>Ask questions, explore ideas, and plan your next move.</p>
              </div>

              <div className="chat">
                <div className="msgs">
                  {messages.map((m, i) => (
                    <div className={"msg " + m.role} key={i}>
                      <div className="bubbleicon">
                        {m.role === "assistant" ? <Bot size={18} /> : "Y"}
                      </div>
                      <div>
                        <small>
                          {m.role === "assistant" ? "APPU AI" : "YOU"}
                        </small>
                        <p>{m.content}</p>
                        {m.tool && (
                          <em>ROUTE · {m.tool.replaceAll("_", " ")}</em>
                        )}
                      </div>
                    </div>
                  ))}
                  {busy && <p className="muted">Appu AI is thinking…</p>}
                </div>

                <form
                  className="composer"
                  onSubmit={(e) => {
                    e.preventDefault();
                    send();
                  }}
                >
                  <Sparkles size={18} />
                  <input
                    value={input}
                    onChange={(e) => I(e.target.value)}
                    placeholder="Message Appu AI…"
                  />
                  <button disabled={!input.trim() || busy}>
                    <Send size={17} />
                  </button>
                </form>

                <small className="hint">
                  AI can make mistakes. Review important information before
                  acting.
                </small>
              </div>
            </>
          )}

          {page === "Image Studio" && (
            <>
              <div className="heading">
                <div className="eyebrow">✧ CREATIVE TOOLS</div>
                <h1>Image Studio</h1>
                <p>
                  Upload images to create a collage or remove a background.
                </p>
              </div>

              <div className="twocol">
                <div className="panel">
                  <h3>
                    <Upload size={17} /> Upload images
                  </h3>
                  <label className="drop">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        F(Array.from(e.target.files || []));
                        ST("");
                        R("");
                      }}
                    />
                    <ImagePlus size={30} />
                    <b>Choose your images</b>
                    <small>PNG, JPG, or WEBP · Browse files</small>
                  </label>

                  {files.map((f) => (
                    <p className="file" key={f.name}>
                      ▧ {f.name} <small>{Math.round(f.size / 1024)} KB</small>
                    </p>
                  ))}

                  <div className="buttons">
                    <button
                      className="primary"
                      onClick={() => process("/api/images/collage")}
                    >
                      Create collage
                    </button>
                    <button
                      className="secondary"
                      onClick={() => process("/api/images/remove-background")}
                    >
                      Remove background
                    </button>
                  </div>

                  <p className="muted">
                    Background removal requires the optional rembg package.
                  </p>
                </div>

                <div className="panel">
                  <h3>Preview</h3>
                  {result ? (
                    <>
                      <img className="result" src={result} alt="Processed result" />
                      <a
                        className="primary link"
                        href={result}
                        download="appu-ai-result.png"
                      >
                        Download result
                      </a>
                    </>
                  ) : (
                    <div className="empty">
                      <ImagePlus size={30} />
                      <b>Your creation appears here</b>
                      <small>Upload images and select a tool.</small>
                    </div>
                  )}
                  {status && <p className="statusmsg">{status}</p>}
                </div>
              </div>
            </>
          )}

          {page === "Decision Center" && (
            <>
              <div className="heading">
                <div className="eyebrow">✧ DECISION INTELLIGENCE</div>
                <h1>Think it through.</h1>
                <p>
                  Compare options, understand trade-offs, and decide with more
                  confidence.
                </p>
              </div>

              <div className="panel decision">
                <div className="cardicon">
                  <BrainCircuit />
                </div>
                <h2>What are you deciding?</h2>
                <p>
                  Describe the situation and Appu AI will help you compare
                  options and risks.
                </p>
                <textarea
                  id="decision"
                  placeholder="Example: Should I learn React or Python first? My goal is to build projects for my resume…"
                />
                <button
                  className="primary"
                  onClick={() => {
                    const v = document.getElementById("decision").value;
                    if (v.trim()) {
                      S("AI Chat");
                      send(
                        "Help me make this decision. Compare options, pros and cons, risks, and recommend a next step: " +
                          v
                      );
                    }
                  }}
                >
                  Analyze decision <ChevronRight size={16} />
                </button>
                <p className="muted">
                  Appu AI supports your judgment; it doesn't make important
                  decisions for you.
                </p>
              </div>
            </>
          )}

          {page === "Memory Vault" && (
            <>
              <div className="heading">
                <div className="eyebrow">✧ PERSONAL CONTEXT</div>
                <h1>Memory Vault</h1>
                <p>Save information for Appu AI to use when relevant.</p>
              </div>

              <div className="panel">
                <form className="inline" onSubmit={saveMemory}>
                  <input
                    value={memoryInput}
                    onChange={(e) => MI(e.target.value)}
                    placeholder="e.g. My project uses React and FastAPI"
                  />
                  <button
                    className="primary"
                    disabled={!memoryInput.trim()}
                  >
                    <Plus size={16} /> Save memory
                  </button>
                </form>

                {memories.length ? (
                  memories.map((m) => (
                    <div className="saved" key={m.id}>
                      <span>✧</span>
                      <p>
                        {m.content}
                        <small>{m.created_at}</small>
                      </p>
                      <button
                        className="delete"
                        onClick={async () => {
                          await fetch(API + "/api/memories/" + m.id, {
                            method: "DELETE",
                          });
                          refresh();
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="empty">
                    <ShieldCheck size={28} />
                    <b>No memories saved yet</b>
                    <small>
                      Save useful context to personalize future chats.
                    </small>
                  </div>
                )}

                <p className="muted">
                  Stored locally in SQLite. Do not save passwords or sensitive
                  information.
                </p>
              </div>
            </>
          )}

          {page === "Task Manager" && (
            <>
              <div className="heading">
                <div className="eyebrow">✧ EXECUTION BOARD</div>
                <h1>Task Manager</h1>
                <p>Keep your next steps visible and manageable.</p>
              </div>

              <div className="panel">
                <form className="inline" onSubmit={addTask}>
                  <input
                    value={taskInput}
                    onChange={(e) => TI(e.target.value)}
                    placeholder="Add a task…"
                  />
                  <button className="primary" disabled={!taskInput.trim()}>
                    <Plus size={16} /> Add task
                  </button>
                </form>

                {tasks.length ? (
                  tasks.map((t) => (
                    <div
                      className={"task " + (t.done ? "done" : "")}
                      key={t.id}
                    >
                      <button onClick={() => toggle(t)}>
                        {t.done ? "✓" : ""}
                      </button>
                      <span>{t.title}</span>
                      <small>{t.done ? "DONE" : "OPEN"}</small>
                    </div>
                  ))
                ) : (
                  <div className="empty">
                    <Check size={28} />
                    <b>Your task list is clear</b>
                    <small>Add a task to get started.</small>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <footer>
          APPU AI · PERSONAL INTELLIGENCE WORKSPACE
          <span>
            <i className={online ? "" : "off"} />
            {online ? "API CONNECTED" : "DEMO UI"}
          </span>
        </footer>
      </main>
    </div>
  );
}