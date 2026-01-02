#include "Characters/BaseCharacter.h"
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
