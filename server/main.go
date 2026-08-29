package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/gorilla/websocket"
)

// Config holds server configuration
type Config struct {
	Port          string
	AuthToken     string
	ClaudeCodeBin string
	RepoPath      string
	StaticDir     string
}

// ChatMessage represents a message to/from Claude Code
type ChatMessage struct {
	Role        string       `json:"role"`
	Text        string       `json:"text"`
	Attachments []Attachment `json:"attachments,omitempty"`
	Skill       string       `json:"skill,omitempty"`
	EffortLevel string       `json:"effortLevel,omitempty"`
}

// Attachment represents a file/image/voice attachment
type Attachment struct {
	Kind     string `json:"kind"` // image, voice, file
	Name     string `json:"name"`
	Content  string `json:"content"` // base64 for images, transcription for voice
	Duration int    `json:"duration,omitempty"`
}

// GitStatus represents uncommitted changes
type GitStatus struct {
	Files []GitFile `json:"files"`
}

type GitFile struct {
	Path    string `json:"path"`
	Status  string `json:"status"`
	Added   int    `json:"added"`
	Removed int    `json:"removed"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func main() {
	cfg := &Config{
		Port:          getEnv("PORT", "3456"),
		AuthToken:     getEnv("AUTH_TOKEN", ""),
		ClaudeCodeBin: getEnv("CLAUDE_CODE_BIN", "claude-code"),
		RepoPath:      getEnv("REPO_PATH", "/workspace"),
		StaticDir:     getEnv("STATIC_DIR", "./dist"),
	}

	if cfg.AuthToken == "" {
		log.Println("WARNING: No AUTH_TOKEN set, server is unprotected!")
	}

	r := chi.NewRouter()

	// CORS for development
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	// Auth middleware
	r.Use(authMiddleware(cfg.AuthToken))

	// API routes
	r.Route("/api", func(r chi.Router) {
		r.Post("/chat", handleChat(cfg))
		r.Get("/chat/stream", handleChatStream(cfg))
		r.Get("/git/status", handleGitStatus(cfg))
		r.Post("/git/commit", handleGitCommit(cfg))
		r.Post("/preview", handlePreview(cfg))
		r.Get("/sessions", handleSessions(cfg))
		r.Get("/health", handleHealth)
	})

	// Serve React app
	r.Get("/*", serveStatic(cfg.StaticDir))

	log.Printf("🚀 Claude Code Mobile Server listening on :%s", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, r))
}

func authMiddleware(token string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Skip auth for health check and static files
			if r.URL.Path == "/api/health" || !contains(r.URL.Path, "/api/") {
				next.ServeHTTP(w, r)
				return
			}

			if token == "" {
				next.ServeHTTP(w, r)
				return
			}

			auth := r.Header.Get("Authorization")
			if auth != "Bearer "+token {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func handleChat(cfg *Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var msg ChatMessage
		if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Build claude-code command
		args := []string{"--headless"}
		if msg.EffortLevel != "" {
			args = append(args, "--effort", msg.EffortLevel)
		}

		// Execute claude-code CLI
		ctx, cancel := context.WithTimeout(r.Context(), 2*time.Minute)
		defer cancel()

		cmd := exec.CommandContext(ctx, cfg.ClaudeCodeBin, args...)
		cmd.Dir = cfg.RepoPath
		cmd.Stdin = nil // Would pipe message here in real impl

		output, err := cmd.CombinedOutput()
		if err != nil {
			http.Error(w, string(output), http.StatusInternalServerError)
			return
		}

		// For now, return raw output
		// In production, parse Claude Code's response format
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"response": string(output),
			"status":   "done",
		})
	}
}

func handleChatStream(cfg *Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("Upgrade error:", err)
			return
		}
		defer conn.Close()

		// Read initial message
		var msg ChatMessage
		if err := conn.ReadJSON(&msg); err != nil {
			log.Println("Read error:", err)
			return
		}

		// Stream Claude Code output
		args := []string{"--headless", "--stream"}
		if msg.EffortLevel != "" {
			args = append(args, "--effort", msg.EffortLevel)
		}

		cmd := exec.Command(cfg.ClaudeCodeBin, args...)
		cmd.Dir = cfg.RepoPath

		// In production: pipe stdout line-by-line and send as WebSocket messages
		// For now, placeholder:
		conn.WriteJSON(map[string]string{
			"type": "thinking",
			"data": "Analyzing request...",
		})

		time.Sleep(500 * time.Millisecond)

		conn.WriteJSON(map[string]string{
			"type": "response",
			"data": "Response from Claude Code",
		})
	}
}

func handleGitStatus(cfg *Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cmd := exec.Command("git", "status", "--porcelain")
		cmd.Dir = cfg.RepoPath

		output, err := cmd.Output()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Parse git status output
		// For now, return raw
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"raw": string(output),
		})
	}
}

func handleGitCommit(cfg *Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Message string `json:"message"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		cmd := exec.Command("git", "commit", "-m", req.Message)
		cmd.Dir = cfg.RepoPath

		output, err := cmd.CombinedOutput()
		if err != nil {
			http.Error(w, string(output), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"output": string(output),
		})
	}
}

// PreviewRequest is the body sent by the iOS app when the user types
// "I want to see the app preview".
type PreviewRequest struct {
	Prompt string `json:"prompt"`
}

// PreviewResponse is what we return once the dev server is detected and
// the URL is known. Errors return HTTP 500 with a JSON body containing
// `error`.
type PreviewResponse struct {
	URL     string `json:"url"`
	Command string `json:"command"`
	Title   string `json:"title,omitempty"`
	Error   string `json:"error,omitempty"`
}

// detectPackageManager inspects the repo root and picks the right dev
// command. It checks package.json's `packageManager` field first, then
// falls back to the presence of lockfiles. Returns the command string
// (e.g., "npm run dev") and a human title.
func detectPackageManager(repoPath string) (cmd, title string, err error) {
	pkgPath := filepath.Join(repoPath, "package.json")
	data, err := os.ReadFile(pkgPath)
	if err != nil {
		return "", "", fmt.Errorf("no package.json found at %s", repoPath)
	}

	var pkg struct {
		Name           string            `json:"name"`
		PackageManager string            `json:"packageManager"`
		Scripts        map[string]string `json:"scripts"`
	}
	if err := json.Unmarshal(data, &pkg); err != nil {
		return "", "", fmt.Errorf("failed to parse package.json: %w", err)
	}

	pm := pkg.PackageManager
	if pm == "" {
		for _, f := range []string{"pnpm-lock.yaml", "yarn.lock", "package-lock.json", "bun.lockb"} {
			if _, err := os.Stat(filepath.Join(repoPath, f)); err == nil {
				switch f {
				case "pnpm-lock.yaml":
					pm = "pnpm"
				case "yarn.lock":
					pm = "yarn"
				case "bun.lockb":
					pm = "bun"
				default:
					pm = "npm"
				}
				break
			}
		}
	}
	if pm == "" {
		pm = "npm"
	}

	script := "dev"
	if pkg.Scripts != nil {
		if _, ok := pkg.Scripts["dev"]; !ok {
			if _, ok2 := pkg.Scripts["start"]; ok2 {
				script = "start"
			}
		}
	}

	cmd = fmt.Sprintf("%s run %s", pm, script)
	title = pkg.Name
	if title == "" {
		title = filepath.Base(repoPath)
	}
	return cmd, title, nil
}

// handlePreview implements POST /api/preview. It detects the package
// manager, starts the dev server in the background, waits for the port
// to open, and returns the URL.
func handlePreview(cfg *Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req PreviewRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		cmdStr, title, err := detectPackageManager(cfg.RepoPath)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(PreviewResponse{Error: err.Error()})
			return
		}

		parts := strings.Fields(cmdStr)
		if len(parts) == 0 {
			http.Error(w, "empty dev command", http.StatusInternalServerError)
			return
		}
		devCmd := exec.Command(parts[0], parts[1:]...)
		devCmd.Dir = cfg.RepoPath
		devCmd.Stdout = nil
		devCmd.Stderr = nil
		if err := devCmd.Start(); err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(PreviewResponse{Error: fmt.Sprintf("failed to start %s: %v", cmdStr, err)})
			return
		}
		go func() { _ = devCmd.Wait() }()

		ports := []int{3000, 5173, 8080, 4200, 8000, 4173, 5174, 9000}
		var url string
		for _, p := range ports {
			if waitForPort(p, 8*time.Second) {
				url = fmt.Sprintf("http://localhost:%d", p)
				break
			}
		}
		if url == "" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(PreviewResponse{
				Error: "dev server did not open a known port within 8s",
			})
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(PreviewResponse{
			URL:     url,
			Command: cmdStr,
			Title:   title,
		})
	}
}

// waitForPort polls 127.0.0.1:port until a TCP connection succeeds or the
// timeout elapses. Returns true on success.
func waitForPort(port int, timeout time.Duration) bool {
	deadline := time.Now().Add(timeout)
	addr := fmt.Sprintf("127.0.0.1:%d", port)
	for time.Now().Before(deadline) {
		conn, err := net.DialTimeout("tcp", addr, 250*time.Millisecond)
		if err == nil {
			conn.Close()
			return true
		}
		time.Sleep(300 * time.Millisecond)
	}
	return false
}

func handleSessions(cfg *Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// In production: list active Claude Code sessions
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]map[string]interface{}{
			{
				"id":      "session-1",
				"name":    "aurora-api",
				"host":    "vps.example.com",
				"cwd":     cfg.RepoPath,
				"model":   "Claude Opus 4.5",
				"active":  true,
				"latency": "48ms",
			},
		})
	}
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "ok",
		"time":   time.Now().Unix(),
	})
}

func serveStatic(dir string) http.HandlerFunc {
	fs := http.FileServer(http.Dir(dir))
	return func(w http.ResponseWriter, r *http.Request) {
		// If file doesn't exist, serve index.html (SPA fallback)
		path := filepath.Join(dir, r.URL.Path)
		if _, err := os.Stat(path); os.IsNotExist(err) {
			http.ServeFile(w, r, filepath.Join(dir, "index.html"))
			return
		}
		fs.ServeHTTP(w, r)
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && s[:len(substr)] == substr || 
	       len(s) > len(substr) && indexOf(s, substr) >= 0
}

func indexOf(s, substr string) int {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return i
		}
	}
	return -1
}
