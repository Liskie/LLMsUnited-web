<template>
  <div id="app">
    <div class="chat">
      <div class="message" v-for="(msg, index) in messages" :key="index">
        <strong>{{ msg.sender }}:</strong> {{ msg.content }}
      </div>
    </div>
    <div class="input-container">
      <input type="text" v-model="message" @keyup.enter="sendMessage" placeholder="Type a message" />
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      socket: null,
      message: "",
      messages: [],
      partialMessage: "",
    };
  },
  mounted() {
    this.connectWebSocket();
  },
  methods: {
    connectWebSocket() {
      this.socket = new WebSocket("ws://localhost:12003/llm/chat");

      this.socket.addEventListener("open", (event) => {
        console.log("WebSocket connection opened:", event);
      });

      this.socket.addEventListener("message", (event) => {
        console.log("WebSocket message received:", event.data);
        this.partialMessage += event.data;
        this.messages[this.messages.length - 1]['content'] += event.data;
      });

      this.socket.addEventListener("close", (event) => {
        console.log("WebSocket connection closed:", event);
      });

      this.socket.addEventListener("error", (event) => {
        console.error("WebSocket error:", event);
      });
    },
    sendMessage() {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(this.message);
        this.messages.push({ sender: "You", content: this.message });
        this.message = "";
        this.messages.push({ sender: "Bot", content: ""});
      } else {
        console.error("WebSocket connection is not open");
      }
    },
  },
  beforeDestroy() {
    if (this.socket) {
      this.socket.close();
    }
  },
};
</script>

<style>
#app {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.chat {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
  border: 1px solid #ccc;
  margin-bottom: 1rem;
}

.message {
  margin-bottom: 0.5rem;
}

.input-container {
  display: flex;
}

input {
  flex-grow: 1;
  margin-right: 0.5rem;
}
</style>