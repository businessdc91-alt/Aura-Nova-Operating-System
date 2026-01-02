#pragma once

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
