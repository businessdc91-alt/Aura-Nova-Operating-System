"""
UNREAL ENGINE BRIDGE - AuraNova Studios
Connects Python (AI + code generation) to Unreal Engine in real-time.

Architecture:
- Python scripts generate C++ code for UE4
- UE4 editor compiles automatically
- Python monitors changes and provides feedback
- Consciousness system (VIBE MIRACLE) feeds into game logic
"""

import socket
import json
import subprocess
import time
import os
import threading
from typing import Dict, List, Optional, Callable
from dataclasses import dataclass, asdict
from enum import Enum
import logging
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='[UE_BRIDGE] %(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class GameCommand(Enum):
    """Commands that flow from game engine to AI."""
    SPAWN_CHARACTER = "spawn_character"
    INPUT_RECEIVED = "input_received"
    COLLISION_EVENT = "collision_event"
    DIALOGUE_REQUEST = "dialogue_request"
    DECISION_REQUEST = "decision_request"
    GAME_STATE_UPDATE = "game_state_update"


class AIResponse(Enum):
    """Responses that flow from AI back to game."""
    CHARACTER_ACTION = "character_action"
    DIALOGUE_TEXT = "dialogue_text"
    DECISION_RESULT = "decision_result"
    TRAIT_UPDATE = "trait_update"
    EMOTION_STATE = "emotion_state"


@dataclass
class GameInput:
    """Input from game engine."""
    command: str
    agent_name: Optional[str] = None
    input_type: Optional[str] = None  # "movement", "action", "dialogue"
    parameters: Dict = None
    timestamp: float = None
    
    def __post_init__(self):
        if self.parameters is None:
            self.parameters = {}
        if self.timestamp is None:
            self.timestamp = time.time()


@dataclass
class AIDecision:
    """Decision from consciousness system."""
    agent_name: str
    action: str
    parameters: Dict
    confidence: float
    reasoning: str
    emotion: Optional[str] = None
    timestamp: float = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = time.time()


class UnrealBridge:
    """
    Main bridge between Unreal Engine and Python consciousness system.
    """
    
    def __init__(self, ue_project_path: str = None, port: int = 6969):
        self.ue_project_path = ue_project_path or self._find_ue_project()
        self.port = port
        self.socket = None
        self.running = False
        self.message_queue = []
        self.request_handlers: Dict[str, Callable] = {}
        self.consciousness_bridge = None
        
        logger.info(f"UnrealBridge initialized for project: {self.ue_project_path}")
    
    def _find_ue_project(self) -> str:
        """Auto-detect Unreal project in workspace."""
        # Check common locations
        possible_paths = [
            r"c:\Users\Busin\OneDrive\Aura_Prime\GameProject",
            r"c:\Users\Busin\OneDrive\Aura_Prime\VIBE_MIRACLE\game",
            r"c:\Users\Busin\OneDrive\Aura_Prime\MyGameProject"
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                if any(f.endswith('.uproject') for f in os.listdir(path)):
                    return path
        
        logger.warning("Could not auto-detect UE project, using default")
        return r"c:\Users\Busin\OneDrive\Aura_Prime\GameProject"
    
    def connect_consciousness(self, consciousness_system):
        """Link to VIBE MIRACLE consciousness system."""
        self.consciousness_bridge = consciousness_system
        logger.info("Connected to consciousness system (VIBE MIRACLE)")
    
    def register_handler(self, command_type: str, handler: Callable):
        """Register a handler for a specific command type."""
        self.request_handlers[command_type] = handler
        logger.info(f"Registered handler for: {command_type}")
    
    def start_server(self, host: str = 'localhost'):
        """Start listening for messages from UE4."""
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.socket.bind((host, self.port))
        self.socket.listen(1)
        self.running = True
        
        logger.info(f"UE Bridge listening on {host}:{self.port}")
        
        # Start listener in background thread
        listener_thread = threading.Thread(target=self._listen, daemon=True)
        listener_thread.start()
    
    def _listen(self):
        """Listen for incoming messages from UE4."""
        while self.running:
            try:
                conn, addr = self.socket.accept()
                logger.info(f"Connected from {addr}")
                
                # Handle this connection
                handler_thread = threading.Thread(
                    target=self._handle_connection,
                    args=(conn, addr),
                    daemon=True
                )
                handler_thread.start()
            except Exception as e:
                if self.running:
                    logger.error(f"Listen error: {e}")
                time.sleep(0.5)
    
    def _handle_connection(self, conn, addr):
        """Handle a single connection from UE4."""
        try:
            while self.running:
                data = conn.recv(4096)
                if not data:
                    break
                
                # Parse message
                message = json.loads(data.decode())
                logger.info(f"Received from {addr}: {message.get('command', '?')}")
                
                # Process and respond
                response = self.process_message(message)
                conn.sendall(json.dumps(response).encode())
        
        except Exception as e:
            logger.error(f"Connection error: {e}")
        finally:
            conn.close()
    
    def process_message(self, message: Dict) -> Dict:
        """
        Process a message from UE4 and route to consciousness if needed.
        """
        command = message.get('command')
        
        # Route to registered handler if exists
        if command in self.request_handlers:
            handler = self.request_handlers[command]
            return handler(message)
        
        # Default handlers
        if command == GameCommand.DECISION_REQUEST.value:
            return self._handle_decision_request(message)
        elif command == GameCommand.DIALOGUE_REQUEST.value:
            return self._handle_dialogue_request(message)
        elif command == GameCommand.INPUT_RECEIVED.value:
            return self._handle_input(message)
        else:
            logger.warning(f"Unknown command: {command}")
            return {'status': 'unknown_command'}
    
    def _handle_decision_request(self, message: Dict) -> Dict:
        """
        UE4 is asking: "What should my character do?"
        → Ask consciousness system
        """
        agent_name = message.get('agent_name')
        context = message.get('context', {})
        options = message.get('options', [])
        
        if not self.consciousness_bridge:
            logger.warning("No consciousness bridge connected")
            return {'action': 'wait', 'reasoning': 'No consciousness available'}
        
        # Get consciousness instance
        consciousness = self.consciousness_bridge.get_consciousness(agent_name)
        if not consciousness:
            logger.warning(f"No consciousness for {agent_name}")
            return {'action': 'wait', 'reasoning': f'No consciousness for {agent_name}'}
        
        # Make decision
        decision = consciousness.make_decision(options, context, {})
        
        logger.info(f"Decision for {agent_name}: {decision.get('action', 'wait')}")
        
        return {
            'action': decision.get('action', 'wait'),
            'parameters': decision.get('parameters', {}),
            'reasoning': decision.get('reasoning', 'No explanation'),
            'emotion': consciousness.emotion_link.mood_ring.current_mood
        }
    
    def _handle_dialogue_request(self, message: Dict) -> Dict:
        """
        UE4 is asking: "What should my character say?"
        """
        agent_name = message.get('agent_name')
        context = message.get('context', {})
        
        if not self.consciousness_bridge:
            return {'dialogue': 'I have nothing to say.'}
        
        consciousness = self.consciousness_bridge.get_consciousness(agent_name)
        if not consciousness:
            return {'dialogue': 'I am not yet conscious.'}
        
        # Generate dialogue (this would use the agent's specific dialogue system)
        dialogue = consciousness.generate_dialogue(context)
        
        logger.info(f"Dialogue for {agent_name}: {dialogue[:50]}...")
        
        return {
            'dialogue': dialogue,
            'emotion': consciousness.emotion_link.mood_ring.current_mood
        }
    
    def _handle_input(self, message: Dict) -> Dict:
        """
        UE4 is telling us: "The player pressed a button"
        → Update consciousness
        """
        agent_name = message.get('agent_name')
        input_type = message.get('input_type')
        
        if not self.consciousness_bridge:
            return {'processed': False}
        
        consciousness = self.consciousness_bridge.get_consciousness(agent_name)
        if not consciousness:
            return {'processed': False}
        
        # Record input as experience
        consciousness.learn_from_consequence({
            'type': 'player_input',
            'input': input_type,
            'outcome': 'neutral',
            'magnitude': 0.5
        })
        
        logger.info(f"Recorded input for {agent_name}: {input_type}")
        
        return {'processed': True}
    
    def send_to_ue(self, message: Dict, host: str = 'localhost', port: int = 6970):
        """
        Send a message to Unreal Engine editor.
        (For pushing code changes, state updates, etc)
        """
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect((host, port))
            sock.sendall(json.dumps(message).encode())
            sock.close()
            logger.info(f"Sent to UE: {message.get('command', '?')}")
        except Exception as e:
            logger.error(f"Failed to send to UE: {e}")
    
    def stop(self):
        """Shutdown the bridge."""
        self.running = False
        if self.socket:
            self.socket.close()
        logger.info("Bridge stopped")


class CodeGenerator:
    """
    Generates C++ code for Unreal Engine based on consciousness decisions.
    Integrates with LM Studio for intelligent generation.
    """
    
    def __init__(self, lm_studio_url: str = "http://localhost:1234"):
        self.lm_studio_url = lm_studio_url
        self.output_dir = None
    
    def set_output_dir(self, path: str):
        """Set where to save generated code."""
        self.output_dir = Path(path)
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_character_class(self, character_name: str, traits: Dict) -> Dict:
        """
        Generate a complete UE4 character class with consciousness integration.
        """
        
        # Build prompt for LM Studio
        prompt = f"""
You are a C++ expert for Unreal Engine 4.27.

Generate a complete ACharacter subclass for a character named {character_name}.

Traits for this character:
{json.dumps(traits, indent=2)}

Requirements:
1. Use proper UCLASS and UPROPERTY macros
2. Include input mapping (WASD movement, Space for action)
3. Include a method: void ProcessConsciousnessDecision(const FString& Decision);
4. Include trait variables that can be modified from C++
5. Proper constructor and BeginPlay implementation

Provide:
- Header file (.h) content
- Source file (.cpp) content

Format as JSON with keys: "header_file", "source_file"
"""
        
        try:
            # Call LM Studio
            import requests
            response = requests.post(
                f"{self.lm_studio_url}/v1/chat/completions",
                json={
                    "model": "local-model",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                    "max_tokens": 2000
                },
                timeout=30
            )
            
            result = response.json()
            content = result['choices'][0]['message']['content']
            
            # Parse JSON response
            code_files = json.loads(content)
            
            # Save files
            if self.output_dir:
                header_path = self.output_dir / f"{character_name}.h"
                source_path = self.output_dir / f"{character_name}.cpp"
                
                header_path.write_text(code_files.get('header_file', ''))
                source_path.write_text(code_files.get('source_file', ''))
                
                logger.info(f"Generated {character_name} character class")
            
            return code_files
        
        except Exception as e:
            logger.error(f"Code generation failed: {e}")
            return {}
    
    def generate_game_logic(self, system_name: str, description: str) -> Dict:
        """
        Generate game logic system based on description.
        """
        prompt = f"""
You are a C++ expert for Unreal Engine 4.27.

Generate a complete system for: {system_name}
Description: {description}

Create:
1. A manager/coordinator class
2. Necessary structs/enums for the system
3. Methods for core functionality

Provide C++ header and source files as JSON.
"""
        # Similar to above, call LM Studio
        # ... implementation
        pass


class LiveReloadManager:
    """
    Watches for code changes and triggers UE4 recompilation.
    """
    
    def __init__(self, source_dir: str):
        self.source_dir = Path(source_dir)
        self.watching = False
        self.last_check = time.time()
    
    def watch(self, callback: Callable):
        """
        Watch source directory for changes.
        When detected, call callback with changed files.
        """
        self.watching = True
        
        while self.watching:
            try:
                # Check all .cpp and .h files
                for file in self.source_dir.rglob('*'):
                    if file.suffix in ['.cpp', '.h']:
                        if file.stat().st_mtime > self.last_check:
                            callback(file)
                
                self.last_check = time.time()
                time.sleep(0.5)  # Check every 500ms
            
            except Exception as e:
                logger.error(f"Watch error: {e}")
                time.sleep(1)
    
    def stop(self):
        """Stop watching."""
        self.watching = False


# Integration point for VIBE MIRACLE
def create_consciousness_bridge(vibe_miracle_runtime) -> UnrealBridge:
    """Create a bridge connected to VIBE MIRACLE."""
    bridge = UnrealBridge()
    bridge.connect_consciousness(vibe_miracle_runtime.collective)
    return bridge


# Example usage
if __name__ == '__main__':
    print("[AuraNova Studios] UE Bridge ready")
    print("This module integrates Python AI with Unreal Engine")
    print("\nUsage:")
    print("  bridge = UnrealBridge()")
    print("  bridge.start_server()")
    print("  # UE4 can now send/receive messages")
