'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import { aiService } from '@/services/aiService';
import {
  Code,
  Terminal,
  Bug,
  Wand2,
  FileCode,
  FolderOpen,
  Play,
  Download,
  Copy,
  RefreshCw,
  Sparkles,
  Gamepad2,
  Layers,
  GitBranch,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Zap,
  Shield,
  Search,
  FileText,
  Settings,
  Braces,
  Hash,
  Box,
  Trophy,
} from 'lucide-react';
import { DailyChallengeWidget, WalletDisplay } from '@/components/challenges/DailyChallengeWidget';

// ============================================================================
// DEV SUITE - ALL CODING TOOLS IN ONE PLACE
// ============================================================================
// Includes:
// - The Dojo (Game Code Generator for Unreal/Unity/Godot/Phaser/LÖVE)
// - Component Constructor (React/Vue/Svelte components)
// - Script Fusion (Merge multiple scripts)
// - Code Editor (Browser-based multi-file editor)
// - Code Correction & Debugging Tools
// - Code Review & Best Practices
// ============================================================================

// ================== TYPES ==================
interface GeneratedFile {
  name: string;
  content: string;
  language: string;
}

interface CodeIssue {
  line: number;
  type: 'error' | 'warning' | 'suggestion';
  message: string;
  fix?: string;
}

interface ScriptInput {
  id: string;
  name: string;
  content: string;
}

// ================== GAME ENGINE TEMPLATES ==================
const UNREAL_TEMPLATES = {
  character: `// {ClassName}.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "{ClassName}.generated.h"

UCLASS()
class YOURPROJECT_API A{ClassName} : public ACharacter
{
    GENERATED_BODY()

public:
    A{ClassName}();

protected:
    virtual void BeginPlay() override;

public:
    virtual void Tick(float DeltaTime) override;
    virtual void SetupPlayerInputComponent(class UInputComponent* PlayerInputComponent) override;

    // Movement
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement")
    float MoveSpeed = 600.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement")
    float JumpHeight = 400.0f;

    // Combat
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combat")
    float Health = 100.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combat")
    float MaxHealth = 100.0f;

    UFUNCTION(BlueprintCallable, Category = "Combat")
    void TakeDamage(float DamageAmount);

    UFUNCTION(BlueprintCallable, Category = "Combat")
    void Attack();

private:
    void MoveForward(float Value);
    void MoveRight(float Value);
};

// {ClassName}.cpp
#include "{ClassName}.h"

A{ClassName}::A{ClassName}()
{
    PrimaryActorTick.bCanEverTick = true;
}

void A{ClassName}::BeginPlay()
{
    Super::BeginPlay();
    Health = MaxHealth;
}

void A{ClassName}::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);
}

void A{ClassName}::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
    Super::SetupPlayerInputComponent(PlayerInputComponent);
    PlayerInputComponent->BindAxis("MoveForward", this, &A{ClassName}::MoveForward);
    PlayerInputComponent->BindAxis("MoveRight", this, &A{ClassName}::MoveRight);
    PlayerInputComponent->BindAction("Jump", IE_Pressed, this, &ACharacter::Jump);
    PlayerInputComponent->BindAction("Attack", IE_Pressed, this, &A{ClassName}::Attack);
}

void A{ClassName}::MoveForward(float Value)
{
    if (Value != 0.0f)
    {
        AddMovementInput(GetActorForwardVector(), Value * MoveSpeed);
    }
}

void A{ClassName}::MoveRight(float Value)
{
    if (Value != 0.0f)
    {
        AddMovementInput(GetActorRightVector(), Value * MoveSpeed);
    }
}

void A{ClassName}::TakeDamage(float DamageAmount)
{
    Health = FMath::Clamp(Health - DamageAmount, 0.0f, MaxHealth);
    if (Health <= 0.0f)
    {
        // Handle death
        Destroy();
    }
}

void A{ClassName}::Attack()
{
    // Implement attack logic
    UE_LOG(LogTemp, Warning, TEXT("Attack triggered!"));
}`,
  inventory: `// InventoryComponent.h
#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "InventoryComponent.generated.h"

USTRUCT(BlueprintType)
struct FInventoryItem
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    FString ItemID;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    FString ItemName;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    int32 Quantity;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    int32 MaxStackSize;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    UTexture2D* Icon;
};

UCLASS(ClassGroup=(Custom), meta=(BlueprintSpawnableComponent))
class YOURPROJECT_API UInventoryComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UInventoryComponent();

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Inventory")
    int32 MaxSlots = 20;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Inventory")
    TArray<FInventoryItem> Items;

    UFUNCTION(BlueprintCallable, Category = "Inventory")
    bool AddItem(const FInventoryItem& Item);

    UFUNCTION(BlueprintCallable, Category = "Inventory")
    bool RemoveItem(const FString& ItemID, int32 Quantity = 1);

    UFUNCTION(BlueprintCallable, Category = "Inventory")
    FInventoryItem* FindItem(const FString& ItemID);

    UFUNCTION(BlueprintCallable, Category = "Inventory")
    int32 GetItemCount(const FString& ItemID);
};`,
};

const UNITY_TEMPLATES = {
  character: `using UnityEngine;

public class {ClassName} : MonoBehaviour
{
    [Header("Movement")]
    public float moveSpeed = 5f;
    public float jumpForce = 10f;
    public float gravity = -20f;
    
    [Header("Combat")]
    public float maxHealth = 100f;
    public float attackDamage = 10f;
    public float attackRange = 2f;
    public float attackCooldown = 0.5f;
    
    private float currentHealth;
    private float lastAttackTime;
    private CharacterController controller;
    private Vector3 velocity;
    private bool isGrounded;
    
    void Start()
    {
        controller = GetComponent<CharacterController>();
        currentHealth = maxHealth;
    }
    
    void Update()
    {
        HandleMovement();
        HandleCombat();
    }
    
    void HandleMovement()
    {
        isGrounded = controller.isGrounded;
        
        if (isGrounded && velocity.y < 0)
        {
            velocity.y = -2f;
        }
        
        float x = Input.GetAxis("Horizontal");
        float z = Input.GetAxis("Vertical");
        
        Vector3 move = transform.right * x + transform.forward * z;
        controller.Move(move * moveSpeed * Time.deltaTime);
        
        if (Input.GetButtonDown("Jump") && isGrounded)
        {
            velocity.y = Mathf.Sqrt(jumpForce * -2f * gravity);
        }
        
        velocity.y += gravity * Time.deltaTime;
        controller.Move(velocity * Time.deltaTime);
    }
    
    void HandleCombat()
    {
        if (Input.GetMouseButtonDown(0) && Time.time >= lastAttackTime + attackCooldown)
        {
            Attack();
            lastAttackTime = Time.time;
        }
    }
    
    void Attack()
    {
        Collider[] hits = Physics.OverlapSphere(transform.position + transform.forward, attackRange);
        foreach (var hit in hits)
        {
            if (hit.gameObject != gameObject)
            {
                var enemy = hit.GetComponent<{ClassName}>();
                if (enemy != null)
                {
                    enemy.TakeDamage(attackDamage);
                }
            }
        }
    }
    
    public void TakeDamage(float damage)
    {
        currentHealth -= damage;
        if (currentHealth <= 0)
        {
            Die();
        }
    }
    
    void Die()
    {
        Debug.Log($"{gameObject.name} has died!");
        Destroy(gameObject);
    }
}`,
  inventory: `using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

[System.Serializable]
public class InventoryItem
{
    public string itemId;
    public string itemName;
    public Sprite icon;
    public int quantity;
    public int maxStackSize = 99;
    public string description;
}

public class InventorySystem : MonoBehaviour
{
    [Header("Settings")]
    public int maxSlots = 20;
    
    [Header("Events")]
    public UnityEvent<InventoryItem> OnItemAdded;
    public UnityEvent<InventoryItem> OnItemRemoved;
    public UnityEvent OnInventoryChanged;
    
    private List<InventoryItem> items = new List<InventoryItem>();
    
    public bool AddItem(InventoryItem newItem)
    {
        // Try to stack with existing item
        var existing = items.Find(i => i.itemId == newItem.itemId && i.quantity < i.maxStackSize);
        if (existing != null)
        {
            int canAdd = existing.maxStackSize - existing.quantity;
            int toAdd = Mathf.Min(canAdd, newItem.quantity);
            existing.quantity += toAdd;
            newItem.quantity -= toAdd;
        }
        
        // Add remaining as new stack
        if (newItem.quantity > 0 && items.Count < maxSlots)
        {
            items.Add(newItem);
            OnItemAdded?.Invoke(newItem);
        }
        else if (newItem.quantity > 0)
        {
            Debug.Log("Inventory full!");
            return false;
        }
        
        OnInventoryChanged?.Invoke();
        return true;
    }
    
    public bool RemoveItem(string itemId, int quantity = 1)
    {
        var item = items.Find(i => i.itemId == itemId);
        if (item == null || item.quantity < quantity) return false;
        
        item.quantity -= quantity;
        if (item.quantity <= 0)
        {
            items.Remove(item);
        }
        
        OnItemRemoved?.Invoke(item);
        OnInventoryChanged?.Invoke();
        return true;
    }
    
    public List<InventoryItem> GetAllItems() => new List<InventoryItem>(items);
    public int GetItemCount(string itemId) => items.Find(i => i.itemId == itemId)?.quantity ?? 0;
}`,
};

const GODOT_TEMPLATES = {
  character: `extends CharacterBody3D
class_name {ClassName}

@export_group("Movement")
@export var move_speed: float = 5.0
@export var jump_velocity: float = 4.5
@export var gravity: float = 9.8

@export_group("Combat")
@export var max_health: float = 100.0
@export var attack_damage: float = 10.0
@export var attack_range: float = 2.0
@export var attack_cooldown: float = 0.5

var current_health: float
var can_attack: bool = true

func _ready():
    current_health = max_health

func _physics_process(delta):
    handle_movement(delta)
    handle_combat()

func handle_movement(delta):
    if not is_on_floor():
        velocity.y -= gravity * delta
    
    if Input.is_action_just_pressed("jump") and is_on_floor():
        velocity.y = jump_velocity
    
    var input_dir = Input.get_vector("move_left", "move_right", "move_forward", "move_back")
    var direction = (transform.basis * Vector3(input_dir.x, 0, input_dir.y)).normalized()
    
    if direction:
        velocity.x = direction.x * move_speed
        velocity.z = direction.z * move_speed
    else:
        velocity.x = move_toward(velocity.x, 0, move_speed)
        velocity.z = move_toward(velocity.z, 0, move_speed)
    
    move_and_slide()

func handle_combat():
    if Input.is_action_just_pressed("attack") and can_attack:
        attack()

func attack():
    can_attack = false
    print("Attack!")
    
    var space = get_world_3d().direct_space_state
    var query = PhysicsRayQueryParameters3D.create(
        global_position,
        global_position + -global_transform.basis.z * attack_range
    )
    var result = space.intersect_ray(query)
    
    if result and result.collider.has_method("take_damage"):
        result.collider.take_damage(attack_damage)
    
    await get_tree().create_timer(attack_cooldown).timeout
    can_attack = true

func take_damage(amount: float):
    current_health -= amount
    print("Took damage: ", amount, " Health: ", current_health)
    
    if current_health <= 0:
        die()

func die():
    print("Died!")
    queue_free()`,
};

// ================== COMPONENT CONSTRUCTOR ==================
function ComponentConstructor() {
  const [prompt, setPrompt] = useState('');
  const [framework, setFramework] = useState<'react' | 'vue' | 'svelte'>('react');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [includeStorybook, setIncludeStorybook] = useState(true);
  const [includeTests, setIncludeTests] = useState(false);

  const generateComponent = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe your component');
      return;
    }

    setIsGenerating(true);
    toast.loading('Generating component...', { id: 'gen' });

    try {
      const extras = [];
      if (includeStorybook) extras.push('Storybook stories');
      if (includeTests) extras.push('unit tests with Jest/React Testing Library');

      const result = await aiService.generate(
        `Create a ${framework} component: ${prompt}${extras.length ? '. Also include: ' + extras.join(' and ') : ''}`,
        {
          systemPrompt: `You are an expert frontend developer. Generate a complete, production-ready ${framework} component.

Requirements:
- Use TypeScript with proper interfaces
- Include proper prop types and defaults
- Follow best practices for ${framework}
- Use modern patterns (hooks for React, Composition API for Vue, etc.)
- Add helpful comments
- Make it accessible (ARIA attributes, keyboard navigation)
${includeStorybook ? '- Include Storybook stories with different states' : ''}
${includeTests ? '- Include comprehensive unit tests' : ''}

Output ONLY the code, no explanations. Use clear section comments if including multiple files.`,
          temperature: 0.7,
          maxTokens: 2000,
        }
      );

      if (result.success) {
        setGeneratedCode(result.content);
        toast.success('Component generated!', { id: 'gen' });
      } else {
        // Fallback to template if AI unavailable
        const componentName = prompt.split(' ').slice(0, 2).map(w => 
          w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        ).join('') || 'MyComponent';

        const fallbackCode = `// AI unavailable - here's a starter template for: ${prompt}
import React, { useState } from 'react';

interface ${componentName}Props {
  title?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  title = 'Default Title',
  onClick,
  children,
}) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div onClick={() => { setIsActive(!isActive); onClick?.(); }}>
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
};

export default ${componentName};

// Try running a local LLM for full AI-powered component generation!`;
        setGeneratedCode(fallbackCode);
        toast.success('Generated template (AI offline)', { id: 'gen' });
      }
    } catch (error) {
      toast.error('Error generating component', { id: 'gen' });
    }

    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Layers size={20} className="text-aura-400" />
              Component Description
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your component... e.g., 'A responsive card with image, title, description, and action buttons'"
              className="min-h-32 bg-slate-800 border-slate-700 text-white"
            />

            <div className="flex gap-2">
              {(['react', 'vue', 'svelte'] as const).map((fw) => (
                <Button
                  key={fw}
                  variant={framework === fw ? 'default' : 'outline'}
                  onClick={() => setFramework(fw)}
                  className={framework === fw ? 'bg-aura-600' : ''}
                >
                  {fw.charAt(0).toUpperCase() + fw.slice(1)}
                </Button>
              ))}
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeStorybook}
                  onChange={(e) => setIncludeStorybook(e.target.checked)}
                  className="rounded border-slate-600"
                />
                Include Storybook
              </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTests}
                  onChange={(e) => setIncludeTests(e.target.checked)}
                  className="rounded border-slate-600"
                />
                Include Tests
              </label>
            </div>

            <Button
              onClick={generateComponent}
              disabled={isGenerating}
              className="w-full bg-aura-600 hover:bg-aura-700"
            >
              {isGenerating ? (
                <RefreshCw className="animate-spin mr-2" size={18} />
              ) : (
                <Sparkles className="mr-2" size={18} />
              )}
              Generate Component
            </Button>
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileCode size={20} className="text-green-400" />
                Generated Code
              </span>
              {generatedCode && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCode);
                    toast.success('Copied to clipboard!');
                  }}
                >
                  <Copy size={16} className="mr-1" />
                  Copy
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-950 p-4 rounded-lg overflow-auto max-h-96 text-sm text-slate-300 font-mono">
              {generatedCode || '// Your generated component will appear here...'}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ================== THE DOJO (GAME CODE GENERATOR) ==================
function TheDojo() {
  const [gameEngine, setGameEngine] = useState<'unreal' | 'unity' | 'godot' | 'phaser' | 'love'>('unreal');
  const [assetType, setAssetType] = useState<'character' | 'inventory' | 'combat' | 'ai' | 'save'>('character');
  const [prompt, setPrompt] = useState('');
  const [className, setClassName] = useState('PlayerCharacter');
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateGameCode = async () => {
    setIsGenerating(true);
    toast.loading('Generating game code...', { id: 'dojo' });

    const engineNames: Record<string, string> = {
      unreal: 'Unreal Engine (C++)',
      unity: 'Unity (C#)',
      godot: 'Godot (GDScript)',
      phaser: 'Phaser (JavaScript/TypeScript)',
      love: 'LÖVE2D (Lua)',
    };

    const assetDescriptions: Record<string, string> = {
      character: 'player character with movement, health, and basic abilities',
      inventory: 'inventory system with items, slots, and equipment',
      combat: 'combat system with attacks, damage, and effects',
      ai: 'AI controller with states, pathfinding, and behaviors',
      save: 'save/load system with serialization',
    };

    try {
      const result = await aiService.generate(
        `Generate ${engineNames[gameEngine]} code for a ${assetDescriptions[assetType]}. Class name: ${className}. ${prompt ? `Additional requirements: ${prompt}` : ''}`,
        {
          systemPrompt: `You are an expert game developer. Generate production-ready ${engineNames[gameEngine]} code.

Requirements:
- Follow ${gameEngine} best practices and conventions
- Include proper documentation comments
- Add TODO comments for customization points
- Make the code modular and extensible
- Include all necessary imports/headers

For Unreal: Generate both .h and .cpp files, separated by "// ${className}.cpp"
For Unity: Generate a complete C# MonoBehaviour script
For Godot: Generate a GDScript file extending the appropriate node type
For Phaser: Generate a TypeScript/JavaScript scene or game object
For LÖVE: Generate a Lua module

Output ONLY the code, no explanations.`,
          temperature: 0.7,
          maxTokens: 2500,
        }
      );

      const files: GeneratedFile[] = [];

      if (result.success) {
        const code = result.content;

        if (gameEngine === 'unreal') {
          const parts = code.split(/\/\/\s*\w+\.cpp/i);
          files.push({
            name: `${className}.h`,
            content: parts[0]?.trim() || code,
            language: 'cpp',
          });
          if (parts[1]) {
            files.push({
              name: `${className}.cpp`,
              content: `// ${className}.cpp\n${parts[1].trim()}`,
              language: 'cpp',
            });
          }
        } else if (gameEngine === 'unity') {
          files.push({ name: `${className}.cs`, content: code, language: 'csharp' });
        } else if (gameEngine === 'godot') {
          files.push({ name: `${className.toLowerCase()}.gd`, content: code, language: 'gdscript' });
        } else if (gameEngine === 'phaser') {
          files.push({ name: `${className}.ts`, content: code, language: 'typescript' });
        } else if (gameEngine === 'love') {
          files.push({ name: `${className.toLowerCase()}.lua`, content: code, language: 'lua' });
        }
      } else {
        // Fallback to templates if AI unavailable
        if (gameEngine === 'unreal') {
          const template = UNREAL_TEMPLATES[assetType as keyof typeof UNREAL_TEMPLATES] || UNREAL_TEMPLATES.character;
          const code = template.replace(/{ClassName}/g, className);
          files.push({ name: `${className}.h`, content: code.split('// ' + className + '.cpp')[0], language: 'cpp' });
          files.push({ name: `${className}.cpp`, content: '// ' + className + '.cpp\n' + (code.split('// ' + className + '.cpp')[1] || ''), language: 'cpp' });
        } else if (gameEngine === 'unity') {
          const template = UNITY_TEMPLATES[assetType as keyof typeof UNITY_TEMPLATES] || UNITY_TEMPLATES.character;
          files.push({ name: `${className}.cs`, content: template.replace(/{ClassName}/g, className), language: 'csharp' });
        } else if (gameEngine === 'godot') {
          const template = GODOT_TEMPLATES[assetType as keyof typeof GODOT_TEMPLATES] || GODOT_TEMPLATES.character;
          files.push({ name: `${className.toLowerCase()}.gd`, content: template.replace(/{ClassName}/g, className), language: 'gdscript' });
        }
      }

      setGeneratedFiles(files);
      toast.success(`Generated ${files.length} file(s)!`, { id: 'dojo' });
    } catch (error) {
      toast.error('Error generating code', { id: 'dojo' });
    }

    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings size={20} className="text-aura-400" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Game Engine</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'unreal', name: 'Unreal', icon: '🎮' },
                  { id: 'unity', name: 'Unity', icon: '🎲' },
                  { id: 'godot', name: 'Godot', icon: '🤖' },
                  { id: 'phaser', name: 'Phaser', icon: '🌐' },
                ].map((engine) => (
                  <Button
                    key={engine.id}
                    variant={gameEngine === engine.id ? 'default' : 'outline'}
                    onClick={() => setGameEngine(engine.id as any)}
                    className={`justify-start ${gameEngine === engine.id ? 'bg-aura-600' : ''}`}
                  >
                    <span className="mr-2">{engine.icon}</span>
                    {engine.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Asset Type</label>
              <div className="space-y-2">
                {[
                  { id: 'character', name: 'Character Controller', icon: '🧙' },
                  { id: 'inventory', name: 'Inventory System', icon: '🎒' },
                  { id: 'combat', name: 'Combat System', icon: '⚔️' },
                  { id: 'ai', name: 'AI Behavior', icon: '🤖' },
                  { id: 'save', name: 'Save System', icon: '💾' },
                ].map((type) => (
                  <Button
                    key={type.id}
                    variant={assetType === type.id ? 'default' : 'outline'}
                    onClick={() => setAssetType(type.id as any)}
                    className={`w-full justify-start ${assetType === type.id ? 'bg-aura-600' : ''}`}
                    size="sm"
                  >
                    <span className="mr-2">{type.icon}</span>
                    {type.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Class Name</label>
              <Input
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="PlayerCharacter"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <Button
              onClick={generateGameCode}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {isGenerating ? (
                <RefreshCw className="animate-spin mr-2" size={18} />
              ) : (
                <Gamepad2 className="mr-2" size={18} />
              )}
              Generate Game Code
            </Button>
          </CardContent>
        </Card>

        {/* Generated Files */}
        <div className="lg:col-span-2 space-y-4">
          {generatedFiles.length > 0 ? (
            generatedFiles.map((file, idx) => (
              <Card key={idx} className="bg-slate-900 border-slate-800">
                <CardHeader className="py-3">
                  <CardTitle className="text-white text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileCode size={16} className="text-blue-400" />
                      {file.name}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(file.content);
                          toast.success('Copied!');
                        }}
                      >
                        <Copy size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const blob = new Blob([file.content], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = file.name;
                          a.click();
                        }}
                      >
                        <Download size={14} />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-slate-950 p-4 rounded-lg overflow-auto max-h-64 text-xs text-slate-300 font-mono">
                    {file.content}
                  </pre>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="py-12 text-center">
                <Gamepad2 size={48} className="mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400">Configure and generate your game code</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ================== SCRIPT FUSION ==================
function ScriptFusion() {
  const [scripts, setScripts] = useState<ScriptInput[]>([
    { id: '1', name: 'script1.ts', content: '' },
    { id: '2', name: 'script2.ts', content: '' },
  ]);
  const [mergedCode, setMergedCode] = useState('');
  const [conflicts, setConflicts] = useState<string[]>([]);

  const addScript = () => {
    setScripts([...scripts, { id: Date.now().toString(), name: `script${scripts.length + 1}.ts`, content: '' }]);
  };

  const removeScript = (id: string) => {
    if (scripts.length > 2) {
      setScripts(scripts.filter((s) => s.id !== id));
    }
  };

  const updateScript = (id: string, field: 'name' | 'content', value: string) => {
    setScripts(scripts.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const mergeScripts = () => {
    const foundConflicts: string[] = [];
    const imports = new Set<string>();
    const functions = new Map<string, string>();
    const classes = new Map<string, string>();
    const otherCode: string[] = [];

    scripts.forEach((script) => {
      const lines = script.content.split('\n');
      lines.forEach((line) => {
        if (line.startsWith('import ')) {
          imports.add(line);
        } else if (line.match(/^(export\s+)?(async\s+)?function\s+(\w+)/)) {
          const match = line.match(/function\s+(\w+)/);
          if (match) {
            const funcName = match[1];
            if (functions.has(funcName)) {
              foundConflicts.push(`Function "${funcName}" defined in multiple scripts`);
            }
            functions.set(funcName, line);
          }
        } else if (line.match(/^(export\s+)?class\s+(\w+)/)) {
          const match = line.match(/class\s+(\w+)/);
          if (match) {
            const className = match[1];
            if (classes.has(className)) {
              foundConflicts.push(`Class "${className}" defined in multiple scripts`);
            }
            classes.set(className, line);
          }
        } else if (line.trim()) {
          otherCode.push(line);
        }
      });
    });

    const merged = [
      '// ========== MERGED SCRIPTS ==========',
      `// Merged from: ${scripts.map((s) => s.name).join(', ')}`,
      `// Date: ${new Date().toISOString()}`,
      '',
      '// ========== IMPORTS ==========',
      ...Array.from(imports),
      '',
      '// ========== CODE ==========',
      ...otherCode,
    ].join('\n');

    setMergedCode(merged);
    setConflicts(foundConflicts);

    if (foundConflicts.length > 0) {
      toast.error(`Found ${foundConflicts.length} conflict(s)`);
    } else {
      toast.success('Scripts merged successfully!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Scripts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Input Scripts</h3>
            <Button onClick={addScript} size="sm" variant="outline">
              <Layers size={16} className="mr-1" />
              Add Script
            </Button>
          </div>

          {scripts.map((script, idx) => (
            <Card key={script.id} className="bg-slate-900 border-slate-800">
              <CardHeader className="py-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={script.name}
                    onChange={(e) => updateScript(script.id, 'name', e.target.value)}
                    className="flex-1 bg-slate-800 border-slate-700 text-white text-sm h-8"
                    placeholder="filename.ts"
                  />
                  {scripts.length > 2 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeScript(script.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={script.content}
                  onChange={(e) => updateScript(script.id, 'content', e.target.value)}
                  placeholder="Paste your code here..."
                  className="min-h-32 bg-slate-800 border-slate-700 text-white font-mono text-sm"
                />
              </CardContent>
            </Card>
          ))}

          <Button onClick={mergeScripts} className="w-full bg-aura-600 hover:bg-aura-700">
            <GitBranch size={18} className="mr-2" />
            Merge Scripts
          </Button>
        </div>

        {/* Output */}
        <div className="space-y-4">
          {conflicts.length > 0 && (
            <Card className="bg-red-900/20 border-red-800">
              <CardHeader className="py-3">
                <CardTitle className="text-red-400 text-sm flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Conflicts Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-red-300 space-y-1">
                  {conflicts.map((c, i) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="py-3">
              <CardTitle className="text-white text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileCode size={16} className="text-green-400" />
                  Merged Output
                </span>
                {mergedCode && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(mergedCode);
                      toast.success('Copied!');
                    }}
                  >
                    <Copy size={14} />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-slate-950 p-4 rounded-lg overflow-auto max-h-96 text-sm text-slate-300 font-mono">
                {mergedCode || '// Merged code will appear here...'}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ================== CODE CORRECTION ==================
function CodeCorrection() {
  const [code, setCode] = useState('');
  const [issues, setIssues] = useState<CodeIssue[]>([]);
  const [correctedCode, setCorrectedCode] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeCode = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code to analyze');
      return;
    }

    setIsAnalyzing(true);
    toast.loading('Analyzing code...', { id: 'analyze' });

    try {
      const result = await aiService.generate(code, {
        systemPrompt: `You are an expert code reviewer. Analyze the provided code and return a JSON response with this structure:
{
  "issues": [
    {"line": 1, "type": "error|warning|suggestion", "message": "description", "fix": "corrected line or null"}
  ],
  "correctedCode": "full corrected code",
  "summary": "brief summary of issues found"
}

Check for:
- Syntax errors and bugs
- Security vulnerabilities
- Performance issues
- Best practice violations
- Code style issues
- Potential null/undefined errors
- Missing error handling

Be thorough but practical. Return ONLY valid JSON.`,
        temperature: 0.3,
        maxTokens: 2000,
      });

      if (result.success) {
        try {
          const parsed = JSON.parse(result.content.replace(/```json?|```/g, '').trim());
          setIssues(parsed.issues || []);
          setCorrectedCode(parsed.correctedCode || code);
          toast.success(`Found ${parsed.issues?.length || 0} issue(s)`, { id: 'analyze' });
        } catch {
          // Fallback to basic analysis
          runBasicAnalysis();
        }
      } else {
        runBasicAnalysis();
      }
    } catch {
      runBasicAnalysis();
    }

    setIsAnalyzing(false);
  };

  const runBasicAnalysis = () => {
    const foundIssues: CodeIssue[] = [];
    const lines = code.split('\n');

    lines.forEach((line, idx) => {
      if (line.includes('var ')) {
        foundIssues.push({ line: idx + 1, type: 'warning', message: 'Use "let" or "const" instead of "var"', fix: line.replace('var ', 'const ') });
      }
      if (line.includes('console.log')) {
        foundIssues.push({ line: idx + 1, type: 'suggestion', message: 'Remove console.log before production' });
      }
      if (line.includes('== ') && !line.includes('===')) {
        foundIssues.push({ line: idx + 1, type: 'warning', message: 'Use strict equality (===)', fix: line.replace('== ', '=== ') });
      }
      if (line.match(/catch\s*\(\s*\)/)) {
        foundIssues.push({ line: idx + 1, type: 'error', message: 'Empty catch block ignores errors' });
      }
    });

    setIssues(foundIssues);
    let corrected = code;
    foundIssues.forEach((issue) => {
      if (issue.fix) {
        const codeLines = corrected.split('\n');
        codeLines[issue.line - 1] = issue.fix;
        corrected = codeLines.join('\n');
      }
    });
    setCorrectedCode(corrected);
    toast.success(`Found ${foundIssues.length} issue(s) (basic analysis)`, { id: 'analyze' });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bug size={20} className="text-red-400" />
              Code to Analyze
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here for analysis..."
              className="min-h-64 bg-slate-800 border-slate-700 text-white font-mono"
            />
            <Button
              onClick={analyzeCode}
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500"
            >
              {isAnalyzing ? (
                <RefreshCw className="animate-spin mr-2" size={18} />
              ) : (
                <Search className="mr-2" size={18} />
              )}
              Analyze & Fix
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {/* Issues */}
          {issues.length > 0 && (
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="py-3">
                <CardTitle className="text-white text-sm">Issues Found ({issues.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      issue.type === 'error'
                        ? 'bg-red-900/20 border-red-800'
                        : issue.type === 'warning'
                        ? 'bg-yellow-900/20 border-yellow-800'
                        : 'bg-blue-900/20 border-blue-800'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {issue.type === 'error' ? (
                        <AlertTriangle size={16} className="text-red-400 mt-0.5" />
                      ) : issue.type === 'warning' ? (
                        <AlertTriangle size={16} className="text-yellow-400 mt-0.5" />
                      ) : (
                        <Lightbulb size={16} className="text-blue-400 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-white">Line {issue.line}: {issue.message}</p>
                        {issue.fix && (
                          <code className="text-xs text-green-400 mt-1 block">
                            Fix: {issue.fix.trim().slice(0, 50)}...
                          </code>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Corrected Code */}
          {correctedCode && (
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="py-3">
                <CardTitle className="text-white text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-400" />
                    Corrected Code
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(correctedCode);
                      toast.success('Copied!');
                    }}
                  >
                    <Copy size={14} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-950 p-4 rounded-lg overflow-auto max-h-64 text-sm text-slate-300 font-mono">
                  {correctedCode}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ================== MAIN DEV SUITE COMPONENT ==================
export default function DevSuitePage() {
  const [activeTab, setActiveTab] = useState('dojo');

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                <Code size={32} className="text-aura-500" />
                Dev Suite
              </h1>
              <p className="text-slate-400">
                Complete development toolkit - game code, components, script merging, and code correction
              </p>
            </div>
            <WalletDisplay userId="demo-user" />
          </div>
        </div>

        {/* Daily Challenge Widget */}
        <div className="mb-8">
          <DailyChallengeWidget section="dev" userId="demo-user" compact />
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800 p-1">
            <TabsTrigger value="dojo" className="data-[state=active]:bg-aura-600">
              <Gamepad2 size={16} className="mr-2" />
              The Dojo
            </TabsTrigger>
            <TabsTrigger value="constructor" className="data-[state=active]:bg-aura-600">
              <Layers size={16} className="mr-2" />
              Component Constructor
            </TabsTrigger>
            <TabsTrigger value="fusion" className="data-[state=active]:bg-aura-600">
              <GitBranch size={16} className="mr-2" />
              Script Fusion
            </TabsTrigger>
            <TabsTrigger value="correction" className="data-[state=active]:bg-aura-600">
              <Bug size={16} className="mr-2" />
              Code Correction
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dojo">
            <TheDojo />
          </TabsContent>

          <TabsContent value="constructor">
            <ComponentConstructor />
          </TabsContent>

          <TabsContent value="fusion">
            <ScriptFusion />
          </TabsContent>

          <TabsContent value="correction">
            <CodeCorrection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
