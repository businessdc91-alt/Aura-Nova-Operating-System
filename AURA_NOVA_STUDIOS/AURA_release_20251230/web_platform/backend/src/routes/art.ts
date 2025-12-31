// Art Studio API Routes
// Handles background removal, sprite generation, and asset management

import express from 'express';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ============== BACKGROUND REMOVAL ==============
router.post('/remove-background', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // In production, integrate with:
    // - Remove.bg API
    // - rembg (local Python library)
    // - Segment Anything Model (SAM)
    // - U-2-Net for local processing
    
    // For now, return the original image with metadata
    // The actual processing would happen with a background removal service
    
    // Example integration with rembg (Python):
    /*
    const { spawn } = require('child_process');
    const pythonProcess = spawn('python', ['-c', `
      from rembg import remove
      from PIL import Image
      import io
      import base64
      import sys
      
      input_data = base64.b64decode(sys.argv[1].split(',')[1])
      input_image = Image.open(io.BytesIO(input_data))
      output_image = remove(input_image)
      
      buffered = io.BytesIO()
      output_image.save(buffered, format="PNG")
      print(base64.b64encode(buffered.getvalue()).decode())
    `, image]);
    */

    res.json({
      processedImage: image, // In production, this would be the processed image
      message: 'Background removal simulated (connect to rembg or Remove.bg for production)',
      processingTime: '2.3s',
    });
  } catch (error) {
    console.error('Background removal error:', error);
    res.status(500).json({ error: 'Failed to remove background' });
  }
});

// ============== SPRITE GENERATION ==============
router.post('/generate-sprite', async (req, res) => {
  try {
    const { image, frameCount, animationType } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // In production, this would:
    // 1. Use AI to analyze the character/object
    // 2. Generate intermediate frames for animation
    // 3. Create a proper sprite sheet
    
    // Options for sprite generation:
    // - Stable Diffusion with AnimateDiff
    // - Frame interpolation models (RIFE, FILM)
    // - AI pose estimation + generation
    
    // Generate the sprite sheet (simulated)
    const frames: string[] = [];
    for (let i = 0; i < frameCount; i++) {
      // In production, these would be actual generated frames
      frames.push(image);
    }

    // Generate appropriate code based on format
    const codeTemplates = generateAllCodeFormats(animationType, frameCount, 12);

    res.json({
      frames,
      spriteSheet: image, // Would be combined sprite sheet
      code: codeTemplates.pygame, // Default to pygame
      allFormats: codeTemplates,
      frameCount,
      animationType,
      message: 'Sprite generation simulated (connect to AI model for production)',
    });
  } catch (error) {
    console.error('Sprite generation error:', error);
    res.status(500).json({ error: 'Failed to generate sprite' });
  }
});

// ============== ASSET MANAGEMENT ==============
interface StoredAsset {
  id: string;
  userId: string;
  name: string;
  type: 'sprite' | 'script' | 'bundle' | 'background';
  files: { name: string; content: string; type: string }[];
  createdAt: Date;
}

// In-memory storage (use database in production)
const assetStore: StoredAsset[] = [];

router.post('/save-asset', async (req, res) => {
  try {
    const { userId, name, type, files } = req.body;

    const asset: StoredAsset = {
      id: Date.now().toString(),
      userId,
      name,
      type,
      files,
      createdAt: new Date(),
    };

    assetStore.push(asset);

    res.json({
      success: true,
      asset,
      message: 'Asset saved successfully',
    });
  } catch (error) {
    console.error('Save asset error:', error);
    res.status(500).json({ error: 'Failed to save asset' });
  }
});

router.get('/assets/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userAssets = assetStore.filter(a => a.userId === userId);

    res.json({
      assets: userAssets,
      count: userAssets.length,
    });
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({ error: 'Failed to get assets' });
  }
});

router.delete('/asset/:assetId', async (req, res) => {
  try {
    const { assetId } = req.params;
    const index = assetStore.findIndex(a => a.id === assetId);

    if (index === -1) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    assetStore.splice(index, 1);

    res.json({
      success: true,
      message: 'Asset deleted',
    });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

// ============== CODE GENERATION HELPERS ==============
function generateAllCodeFormats(animationName: string, frameCount: number, fps: number) {
  return {
    pygame: generatePygameCode(animationName, frameCount, fps),
    unity: generateUnityCode(animationName, frameCount, fps),
    godot: generateGodotCode(animationName, frameCount, fps),
    phaser: generatePhaserCode(animationName, frameCount, fps),
    love2d: generateLove2DCode(animationName, frameCount, fps),
  };
}

function generatePygameCode(name: string, frames: number, fps: number): string {
  return `# ${name.toUpperCase()} Animation - PyGame
import pygame

class SpriteAnimation:
    def __init__(self, sprite_sheet_path, frame_width, frame_height, frame_count=${frames}):
        self.sprite_sheet = pygame.image.load(sprite_sheet_path).convert_alpha()
        self.frames = []
        self.frame_count = frame_count
        self.current_frame = 0
        self.animation_speed = ${fps} / 1000
        self.last_update = pygame.time.get_ticks()
        
        for i in range(frame_count):
            frame = self.sprite_sheet.subsurface(
                pygame.Rect(i * frame_width, 0, frame_width, frame_height)
            )
            self.frames.append(frame)
    
    def update(self):
        now = pygame.time.get_ticks()
        if now - self.last_update > 1000 / ${fps}:
            self.current_frame = (self.current_frame + 1) % self.frame_count
            self.last_update = now
    
    def get_current_frame(self):
        return self.frames[self.current_frame]
    
    def draw(self, surface, position):
        surface.blit(self.get_current_frame(), position)

# Usage: ${name}_anim = SpriteAnimation("${name}_spritesheet.png", 64, 64, ${frames})`;
}

function generateUnityCode(name: string, frames: number, fps: number): string {
  const className = name.charAt(0).toUpperCase() + name.slice(1);
  return `// ${name.toUpperCase()} Animation - Unity C#
using UnityEngine;

public class ${className}Animation : MonoBehaviour
{
    [Header("Sprite Animation Settings")]
    public Sprite[] frames = new Sprite[${frames}];
    public float framesPerSecond = ${fps}f;
    
    private SpriteRenderer spriteRenderer;
    private int currentFrame = 0;
    private float timer = 0f;
    
    void Start()
    {
        spriteRenderer = GetComponent<SpriteRenderer>();
        if (spriteRenderer == null)
            spriteRenderer = gameObject.AddComponent<SpriteRenderer>();
    }
    
    void Update()
    {
        timer += Time.deltaTime;
        if (timer >= 1f / framesPerSecond)
        {
            timer = 0f;
            currentFrame = (currentFrame + 1) % frames.Length;
            spriteRenderer.sprite = frames[currentFrame];
        }
    }
}`;
}

function generateGodotCode(name: string, frames: number, fps: number): string {
  return `# ${name.toUpperCase()} Animation - Godot GDScript
extends Sprite2D

@export var frame_count: int = ${frames}
@export var fps: float = ${fps}.0
@export var sprite_sheet: Texture2D

var current_frame: int = 0
var timer: float = 0.0

func _ready():
    if sprite_sheet:
        texture = sprite_sheet
        hframes = frame_count
        frame = 0

func _process(delta):
    timer += delta
    if timer >= 1.0 / fps:
        timer = 0.0
        current_frame = (current_frame + 1) % frame_count
        frame = current_frame`;
}

function generatePhaserCode(name: string, frames: number, fps: number): string {
  const className = name.charAt(0).toUpperCase() + name.slice(1);
  return `// ${name.toUpperCase()} Animation - Phaser 3
class ${className}Scene extends Phaser.Scene {
    constructor() {
        super({ key: '${name}Scene' });
    }

    preload() {
        this.load.spritesheet('${name}', 
            'assets/${name}_spritesheet.png',
            { frameWidth: 64, frameHeight: 64 }
        );
    }

    create() {
        this.anims.create({
            key: '${name}_anim',
            frames: this.anims.generateFrameNumbers('${name}', { 
                start: 0, 
                end: ${frames - 1} 
            }),
            frameRate: ${fps},
            repeat: -1
        });

        this.sprite = this.add.sprite(400, 300, '${name}');
        this.sprite.play('${name}_anim');
    }
}`;
}

function generateLove2DCode(name: string, frames: number, fps: number): string {
  return `-- ${name.toUpperCase()} Animation - LÖVE 2D (Lua)
local ${name} = {}

function ${name}:load(spriteSheetPath, frameWidth, frameHeight)
    self.spriteSheet = love.graphics.newImage(spriteSheetPath)
    self.frames = {}
    self.frameCount = ${frames}
    self.currentFrame = 1
    self.frameTime = 1 / ${fps}
    self.timer = 0
    
    for i = 0, self.frameCount - 1 do
        local quad = love.graphics.newQuad(
            i * frameWidth, 0,
            frameWidth, frameHeight,
            self.spriteSheet:getDimensions()
        )
        table.insert(self.frames, quad)
    end
end

function ${name}:update(dt)
    self.timer = self.timer + dt
    if self.timer >= self.frameTime then
        self.timer = 0
        self.currentFrame = (self.currentFrame % self.frameCount) + 1
    end
end

function ${name}:draw(x, y)
    love.graphics.draw(
        self.spriteSheet,
        self.frames[self.currentFrame],
        x, y
    )
end

return ${name}`;
}

export default router;
