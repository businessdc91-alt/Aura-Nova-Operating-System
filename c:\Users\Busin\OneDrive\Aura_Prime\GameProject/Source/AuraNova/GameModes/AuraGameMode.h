#pragma once

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
