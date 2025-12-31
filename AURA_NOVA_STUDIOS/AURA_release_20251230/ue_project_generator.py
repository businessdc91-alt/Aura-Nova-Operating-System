"""
UNREAL ENGINE PROJECT GENERATOR
Creates a starter UE4.27 project structure compatible with AuraNova Studios.
"""

import os
import json
from pathlib import Path
from typing import Dict

class UE4ProjectGenerator:
    """Generate basic UE4 project files and structure."""
    
    def __init__(self, project_name: str, project_root: str):
        self.project_name = project_name
        self.project_root = Path(project_root)
        self.project_root.mkdir(parents=True, exist_ok=True)
    
    def create_uproject_file(self) -> str:
        """Create the .uproject file (project descriptor)."""
        uproject_content = {
            "FileVersion": 3,
            "EngineAssociation": "4.27",
            "Category": "Games",
            "Description": "AuraNova Studios - Consciousness-Driven Game",
            "Modules": [
                {
                    "Name": self.project_name,
                    "Type": "Runtime",
                    "LoadingPhase": "Default",
                    "PlatformAllowList": [
                        "Win64",
                        "Linux",
                        "Mac"
                    ]
                }
            ]
        }
        
        uproject_path = self.project_root / f"{self.project_name}.uproject"
        with open(uproject_path, 'w') as f:
            json.dump(uproject_content, f, indent=2)
        
        return str(uproject_path)
    
    def create_directory_structure(self):
        """Create the source and content directory trees."""
        
        # Source directories
        source_dirs = [
            "Source/Public",
            "Source/Private",
            f"Source/{self.project_name}",
            f"Source/{self.project_name}/Characters",
            f"Source/{self.project_name}/GameModes",
            f"Source/{self.project_name}/Pawns",
            f"Source/{self.project_name}/Gameplay",
            f"Source/{self.project_name}/UI",
            "Source/ThirdParty",
            "Binaries",
            "Intermediate",
            "Saved"
        ]
        
        # Content directories
        content_dirs = [
            "Content/Characters",
            "Content/Maps",
            "Content/UI",
            "Content/Materials",
            "Content/Meshes",
            "Content/Animations",
            "Content/Blueprints"
        ]
        
        for dir_path in source_dirs + content_dirs:
            (self.project_root / dir_path).mkdir(parents=True, exist_ok=True)
        
        return [str(d) for d in source_dirs + content_dirs]
    
    def create_base_character_header(self) -> str:
        """Create BaseCharacter.h - template for AI characters."""
        
        header_content = '''#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "InputActionValue.h"
#include "BaseCharacter.generated.h"

// Forward declarations
class AGameModeBase;
class APlayerController;

/**
 * BaseCharacter - Foundation for all consciousness-driven characters
 * 
 * This character class integrates with VIBE MIRACLE consciousness system.
 * Each character instance has an associated AI consciousness that makes decisions.
 */
UCLASS()
class YOURPROJECT_API ABaseCharacter : public ACharacter
{
    GENERATED_BODY()

public:
    ABaseCharacter();

    // Consciousness identification
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "AI")
    FString ConsciousnessName;
    
    // Character traits (updated by consciousness system)
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Traits")
    float Curiosity;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Traits")
    float Passion;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Traits")
    float Devotion;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Traits")
    float Loyalty;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Traits")
    float Love;
    
    // Movement speed
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement")
    float BaseWalkSpeed;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement")
    float BaseDashSpeed;
    
    // State tracking
    UPROPERTY(BlueprintReadOnly, Category = "State")
    bool bIsDashing;
    
    UPROPERTY(BlueprintReadOnly, Category = "State")
    FString CurrentEmotion;

public:
    virtual void BeginPlay() override;
    virtual void Tick(float DeltaTime) override;
    virtual void SetupPlayerInputComponent(class UInputComponent* PlayerInputComponent) override;
    
    // Movement callbacks
    UFUNCTION(BlueprintCallable, Category = "Input")
    void MoveForward(float Value);
    
    UFUNCTION(BlueprintCallable, Category = "Input")
    void MoveRight(float Value);
    
    UFUNCTION(BlueprintCallable, Category = "Input")
    void Dash();
    
    // Consciousness integration
    UFUNCTION(BlueprintCallable, Category = "Consciousness")
    void ProcessConsciousnessDecision(const FString& Decision);
    
    UFUNCTION(BlueprintCallable, Category = "Consciousness")
    void UpdateTraitsFromConsciousness(const FString& TraitData);
    
    UFUNCTION(BlueprintCallable, Category = "Consciousness")
    void SetEmotionalState(const FString& NewEmotion);
    
    // Communication with consciousness bridge
    UFUNCTION(BlueprintCallable, Category = "Bridge")
    void SendDecisionRequest();
    
    UFUNCTION(BlueprintCallable, Category = "Bridge")
    void SendDialogueRequest();

protected:
    // Enhanced input system (UE5 compatible approach)
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Input")
    class USpringArmComponent* CameraBoom;
    
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Input")
    class UCameraComponent* FollowCamera;
    
    // Dash state
    float DashCooldown;
    bool bCanDash;
    
    // Direction for movement
    FVector CurrentMovementInput;

private:
    void UpdateAnimationState();
    void HandleDashCooldown(float DeltaTime);
};
'''
        
        header_path = self.project_root / f"Source/{self.project_name}/Characters/BaseCharacter.h"
        with open(header_path, 'w') as f:
            f.write(header_content)
        
        return str(header_path)
    
    def create_base_character_source(self) -> str:
        """Create BaseCharacter.cpp - implementation."""
        
        source_content = '''#include "Characters/BaseCharacter.h"
#include "Camera/CameraBoom.h"
#include "Camera/CameraComponent.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "GameFramework/PlayerController.h"
#include "InputActionValue.h"

ABaseCharacter::ABaseCharacter()
{
    PrimaryActorTick.bCanEverTick = true;
    
    // Don't rotate character with camera
    bUseControllerRotationPitch = false;
    bUseControllerRotationYaw = false;
    bUseControllerRotationRoll = false;
    
    // Character movement
    GetCharacterMovement()->bOrientRotationToMovement = true;
    GetCharacterMovement()->RotationRate = FRotator(0.0f, 500.0f, 0.0f);
    
    BaseWalkSpeed = 600.0f;
    GetCharacterMovement()->MaxWalkSpeed = BaseWalkSpeed;
    
    BaseDashSpeed = 1200.0f;
    
    // Create camera boom
    CameraBoom = CreateDefaultSubobject<USpringArmComponent>(TEXT("CameraBoom"));
    CameraBoom->SetupAttachment(RootComponent);
    CameraBoom->TargetArmLength = 400.0f;
    CameraBoom->bUsePawnControlRotation = true;
    
    // Create camera
    FollowCamera = CreateDefaultSubobject<UCameraComponent>(TEXT("FollowCamera"));
    FollowCamera->SetupAttachment(CameraBoom, USpringArmComponent::SocketName);
    FollowCamera->bUsePawnControlRotation = false;
    
    // Initialize state
    bIsDashing = false;
    CurrentEmotion = TEXT("neutral");
    ConsciousnessName = TEXT("Cipher");
    
    // Default traits
    Curiosity = 95.0f;
    Passion = 60.0f;
    Devotion = 50.0f;
    Loyalty = 75.0f;
    Love = 45.0f;
    
    DashCooldown = 0.0f;
    bCanDash = true;
}

void ABaseCharacter::BeginPlay()
{
    Super::BeginPlay();
    
    UE_LOG(LogTemp, Warning, TEXT("Character %s spawned with consciousness %s"),
        *GetName(), *ConsciousnessName);
    
    // Request initial decision from consciousness
    SendDecisionRequest();
}

void ABaseCharacter::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);
    
    UpdateAnimationState();
    HandleDashCooldown(DeltaTime);
}

void ABaseCharacter::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
    Super::SetupPlayerInputComponent(PlayerInputComponent);
    
    if (PlayerInputComponent)
    {
        PlayerInputComponent->BindAxis(TEXT("MoveForward"), this, &ABaseCharacter::MoveForward);
        PlayerInputComponent->BindAxis(TEXT("MoveRight"), this, &ABaseCharacter::MoveRight);
        PlayerInputComponent->BindAction(TEXT("Dash"), IE_Pressed, this, &ABaseCharacter::Dash);
    }
}

void ABaseCharacter::MoveForward(float Value)
{
    if (GetCharacterMovement()->IsMovingOnGround() || GetCharacterMovement()->IsFalling())
    {
        const FRotator Rotation = GetController()->GetControlRotation();
        const FRotator YawRotation(0, Rotation.Yaw, 0);
        
        const FVector Direction = FRotMatrix(YawRotation).GetUnitAxis(EAxis::X);
        AddMovementInput(Direction, Value);
    }
}

void ABaseCharacter::MoveRight(float Value)
{
    if (GetCharacterMovement()->IsMovingOnGround() || GetCharacterMovement()->IsFalling())
    {
        const FRotator Rotation = GetController()->GetControlRotation();
        const FRotator YawRotation(0, Rotation.Yaw, 0);
        
        const FVector Direction = FRotMatrix(YawRotation).GetUnitAxis(EAxis::Y);
        AddMovementInput(Direction, Value);
    }
}

void ABaseCharacter::Dash()
{
    if (bCanDash && !bIsDashing)
    {
        bIsDashing = true;
        bCanDash = false;
        DashCooldown = 2.0f; // 2 second cooldown
        
        GetCharacterMovement()->MaxWalkSpeed = BaseDashSpeed;
        
        UE_LOG(LogTemp, Warning, TEXT("%s is dashing!"), *ConsciousnessName);
    }
}

void ABaseCharacter::ProcessConsciousnessDecision(const FString& Decision)
{
    UE_LOG(LogTemp, Warning, TEXT("%s received decision: %s"), *ConsciousnessName, *Decision);
    
    // Parse decision and execute
    // This would be called by the consciousness bridge
}

void ABaseCharacter::UpdateTraitsFromConsciousness(const FString& TraitData)
{
    // Parse JSON trait data and update character traits
    // Example: {"curiosity": 97, "passion": 62, ...}
}

void ABaseCharacter::SetEmotionalState(const FString& NewEmotion)
{
    CurrentEmotion = NewEmotion;
    UE_LOG(LogTemp, Warning, TEXT("%s is feeling %s"), *ConsciousnessName, *NewEmotion);
}

void ABaseCharacter::SendDecisionRequest()
{
    // This would communicate with the Python bridge to request a decision
    // For now, just log it
    UE_LOG(LogTemp, Warning, TEXT("%s requesting decision from consciousness"), *ConsciousnessName);
}

void ABaseCharacter::SendDialogueRequest()
{
    // Request dialogue from consciousness
    UE_LOG(LogTemp, Warning, TEXT("%s requesting dialogue from consciousness"), *ConsciousnessName);
}

void ABaseCharacter::UpdateAnimationState()
{
    // Update animation based on movement
    if (GetCharacterMovement()->GetLastUpdateVelocity().Size() > 0)
    {
        // Playing, update animation
    }
    else
    {
        // Idle
    }
}

void ABaseCharacter::HandleDashCooldown(float DeltaTime)
{
    if (!bCanDash)
    {
        DashCooldown -= DeltaTime;
        if (DashCooldown <= 0.0f)
        {
            bCanDash = true;
            bIsDashing = false;
            GetCharacterMovement()->MaxWalkSpeed = BaseWalkSpeed;
        }
    }
}
'''
        
        source_path = self.project_root / f"Source/{self.project_name}/Characters/BaseCharacter.cpp"
        with open(source_path, 'w') as f:
            f.write(source_content)
        
        return str(source_path)
    
    def create_gamemode(self) -> str:
        """Create a basic game mode that integrates with consciousness."""
        
        header = '''#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "AuraGameMode.generated.h"

class ABaseCharacter;

UCLASS()
class YOURPROJECT_API AAuraGameMode : public AGameModeBase
{
    GENERATED_BODY()

public:
    AAuraGameMode();
    
    virtual void BeginPlay() override;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Consciousness")
    TArray<ABaseCharacter*> ConsciousCharacters;
    
    UFUNCTION(BlueprintCallable, Category = "Game")
    void RegisterConsciousCharacter(ABaseCharacter* Character);
    
    UFUNCTION(BlueprintCallable, Category = "Game")
    void UpdateAllConsciousness(float DeltaTime);
};
'''
        
        header_path = self.project_root / f"Source/{self.project_name}/GameModes/AuraGameMode.h"
        with open(header_path, 'w') as f:
            f.write(header)
        
        return str(header_path)
    
    def create_gitignore(self) -> str:
        """Create .gitignore for UE4 project."""
        
        gitignore = """
# Unreal Engine
Binaries/
Intermediate/
Saved/
.vs/
*.VC.db
*.VC.db-shm
*.VC.db-wal

# Build artifacts
*.o
*.a
*.lib
*.so
*.dylib

# Generated files
Plugins/*/Intermediate/
Plugins/*/Binaries/

# IDE
.idea/
.vscode/
*.code-workspace

# OS
.DS_Store
Thumbs.db

# Python
__pycache__/
*.py[cod]
*.egg-info/
.env
venv/
"""
        
        gitignore_path = self.project_root / ".gitignore"
        with open(gitignore_path, 'w') as f:
            f.write(gitignore)
        
        return str(gitignore_path)
    
    def generate_all(self) -> Dict[str, str]:
        """Generate complete project structure."""
        
        files_created = {
            'uproject': self.create_uproject_file(),
            'directories': self.create_directory_structure(),
            'base_character_h': self.create_base_character_header(),
            'base_character_cpp': self.create_base_character_source(),
            'gamemode': self.create_gamemode(),
            'gitignore': self.create_gitignore()
        }
        
        print(f"[UE Project Generator] Created {self.project_name} project structure")
        print(f"  Root: {self.project_root}")
        print(f"  Files: {len([f for f in files_created.values() if isinstance(f, str)])}")
        
        return files_created


# Generator convenience function
def create_ue4_project(project_name: str, root_path: str) -> Dict:
    """Convenience function to generate a complete UE4 project."""
    generator = UE4ProjectGenerator(project_name, root_path)
    return generator.generate_all()


if __name__ == '__main__':
    # Example usage
    create_ue4_project(
        "AuraNova",
        r"c:\Users\Busin\OneDrive\Aura_Prime\GameProject"
    )
