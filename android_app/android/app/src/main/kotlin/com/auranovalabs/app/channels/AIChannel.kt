package com.auranovalabs.app.channels

import android.app.ActivityManager
import android.content.Context
import io.flutter.plugin.common.EventChannel
import java.io.File
import java.net.URL
import java.io.BufferedInputStream
import java.io.FileOutputStream

/**
 * AIChannel handles all local AI operations using llama.cpp
 * Supports loading GGUF models and generating text locally on device
 */
class AIChannel(private val context: Context) {
    
    // Native llama.cpp interface
    private var modelHandle: Long = 0
    private var isModelLoaded = false
    private var currentModelName: String? = null
    
    // Event sinks for streaming
    private var streamSink: EventChannel.EventSink? = null
    private var downloadSink: EventChannel.EventSink? = null

    companion object {
        init {
            // Load native llama.cpp library
            try {
                System.loadLibrary("llama")
            } catch (e: UnsatisfiedLinkError) {
                // Library not available yet - will be added when building
            }
        }

        // Available models catalog - includes Gemma 3 2B!
        val MODEL_CATALOG = listOf(
            mapOf(
                "id" to "gemma-3-2b-q4",
                "name" to "Gemma 3 2B Q4",
                "description" to "Google's latest Gemma 3 - optimized for mobile",
                "size" to "1.5 GB",
                "ram" to "2 GB",
                "huggingFaceId" to "google/gemma-3-2b-it-gguf",
                "filename" to "gemma-3-2b-it-q4_k_m.gguf",
                "recommended" to true,
                "capabilities" to listOf("chat", "reasoning", "coding")
            ),
            mapOf(
                "id" to "gemma-2-2b-q4",
                "name" to "Gemma 2 2B Q4",
                "description" to "Efficient model for everyday tasks",
                "size" to "1.4 GB",
                "ram" to "2 GB",
                "huggingFaceId" to "google/gemma-2-2b-it-gguf",
                "filename" to "gemma-2-2b-it-q4_k_m.gguf",
                "recommended" to false,
                "capabilities" to listOf("chat", "reasoning")
            ),
            mapOf(
                "id" to "phi-3-mini-q4",
                "name" to "Phi-3 Mini 3.8B Q4",
                "description" to "Microsoft's small but powerful model",
                "size" to "2.2 GB",
                "ram" to "4 GB",
                "huggingFaceId" to "microsoft/Phi-3-mini-4k-instruct-gguf",
                "filename" to "Phi-3-mini-4k-instruct-q4.gguf",
                "recommended" to false,
                "capabilities" to listOf("chat", "reasoning", "coding")
            ),
            mapOf(
                "id" to "qwen2-1.5b-q4",
                "name" to "Qwen2 1.5B Q4",
                "description" to "Ultra-lightweight for low-end devices",
                "size" to "0.9 GB",
                "ram" to "1.5 GB",
                "huggingFaceId" to "Qwen/Qwen2-1.5B-Instruct-GGUF",
                "filename" to "qwen2-1_5b-instruct-q4_k_m.gguf",
                "recommended" to false,
                "capabilities" to listOf("chat")
            ),
            mapOf(
                "id" to "mistral-7b-q4",
                "name" to "Mistral 7B Q4",
                "description" to "High-quality responses (needs 6GB+ RAM)",
                "size" to "4.1 GB",
                "ram" to "6 GB",
                "huggingFaceId" to "TheBloke/Mistral-7B-Instruct-v0.2-GGUF",
                "filename" to "mistral-7b-instruct-v0.2.Q4_K_M.gguf",
                "recommended" to false,
                "capabilities" to listOf("chat", "reasoning", "coding", "creative")
            ),
            mapOf(
                "id" to "llama-3.2-1b-q4",
                "name" to "Llama 3.2 1B Q4",
                "description" to "Meta's compact model for mobile",
                "size" to "0.7 GB",
                "ram" to "1 GB",
                "huggingFaceId" to "meta-llama/Llama-3.2-1B-Instruct-GGUF",
                "filename" to "Llama-3.2-1B-Instruct-Q4_K_M.gguf",
                "recommended" to true,
                "capabilities" to listOf("chat", "reasoning")
            ),
            mapOf(
                "id" to "tinyllama-1.1b",
                "name" to "TinyLlama 1.1B",
                "description" to "Fastest option for older devices",
                "size" to "0.6 GB",
                "ram" to "1 GB",
                "huggingFaceId" to "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF",
                "filename" to "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
                "recommended" to false,
                "capabilities" to listOf("chat")
            )
        )
    }

    // Native methods (implemented in C++ with llama.cpp)
    private external fun nativeLoadModel(modelPath: String): Long
    private external fun nativeGenerate(
        handle: Long,
        prompt: String,
        maxTokens: Int,
        temperature: Float
    ): String
    private external fun nativeGenerateStream(
        handle: Long,
        prompt: String,
        maxTokens: Int,
        temperature: Float,
        callback: (String) -> Unit
    )
    private external fun nativeFreeModel(handle: Long)

    /**
     * Load a GGUF model from the models directory
     */
    fun loadModel(modelName: String): Boolean {
        val modelsDir = File(context.filesDir, "models")
        val modelFile = File(modelsDir, modelName)

        if (!modelFile.exists()) {
            return false
        }

        return try {
            // Unload previous model if any
            if (isModelLoaded) {
                unloadModel()
            }

            modelHandle = nativeLoadModel(modelFile.absolutePath)
            isModelLoaded = modelHandle != 0L
            if (isModelLoaded) {
                currentModelName = modelName
            }
            isModelLoaded
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Generate text using the loaded model
     */
    fun generate(prompt: String, maxTokens: Int, temperature: Double): String {
        if (!isModelLoaded) {
            throw IllegalStateException("No model loaded")
        }

        return try {
            nativeGenerate(modelHandle, prompt, maxTokens, temperature.toFloat())
        } catch (e: Exception) {
            throw RuntimeException("Generation failed: ${e.message}")
        }
    }

    /**
     * Stream generation token by token
     */
    fun generateStream(prompt: String, maxTokens: Int, temperature: Double) {
        if (!isModelLoaded) {
            streamSink?.error("NO_MODEL", "No model loaded", null)
            return
        }

        Thread {
            try {
                nativeGenerateStream(modelHandle, prompt, maxTokens, temperature.toFloat()) { token ->
                    streamSink?.success(token)
                }
            } catch (e: Exception) {
                streamSink?.error("GENERATION_ERROR", e.message, null)
            }
        }.start()
    }

    /**
     * Unload the current model to free memory
     */
    fun unloadModel() {
        if (isModelLoaded && modelHandle != 0L) {
            try {
                nativeFreeModel(modelHandle)
            } catch (e: Exception) {
                // Ignore cleanup errors
            }
            modelHandle = 0
            isModelLoaded = false
            currentModelName = null
        }
    }

    /**
     * Get list of available models with download status
     */
    fun getAvailableModels(): List<Map<String, Any>> {
        val modelsDir = File(context.filesDir, "models")
        val downloadedFiles = modelsDir.listFiles()?.map { it.name } ?: emptyList()

        return MODEL_CATALOG.map { model ->
            val filename = model["filename"] as String
            val isDownloaded = downloadedFiles.contains(filename)
            
            model.toMutableMap().also {
                it["downloaded"] = isDownloaded
                it["isLoaded"] = (currentModelName == filename && isModelLoaded)
            }
        }
    }

    /**
     * Download a model from HuggingFace
     */
    fun downloadModel(modelId: String, onProgress: (Double) -> Unit) {
        val modelInfo = MODEL_CATALOG.find { it["id"] == modelId } ?: return
        val huggingFaceId = modelInfo["huggingFaceId"] as String
        val filename = modelInfo["filename"] as String
        
        val url = "https://huggingface.co/$huggingFaceId/resolve/main/$filename"
        val modelsDir = File(context.filesDir, "models")
        if (!modelsDir.exists()) modelsDir.mkdirs()
        
        val outputFile = File(modelsDir, filename)

        Thread {
            try {
                val connection = URL(url).openConnection()
                val totalSize = connection.contentLength.toLong()
                var downloadedSize = 0L

                BufferedInputStream(connection.getInputStream()).use { input ->
                    FileOutputStream(outputFile).use { output ->
                        val buffer = ByteArray(8192)
                        var bytesRead: Int

                        while (input.read(buffer).also { bytesRead = it } != -1) {
                            output.write(buffer, 0, bytesRead)
                            downloadedSize += bytesRead
                            
                            val progress = downloadedSize.toDouble() / totalSize
                            downloadSink?.success(progress)
                            onProgress(progress)
                        }
                    }
                }

                downloadSink?.success(1.0)
            } catch (e: Exception) {
                downloadSink?.error("DOWNLOAD_ERROR", e.message, null)
                outputFile.delete()
            }
        }.start()
    }

    /**
     * Get device memory information
     */
    fun getMemoryInfo(): Map<String, Long> {
        val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memInfo = ActivityManager.MemoryInfo()
        activityManager.getMemoryInfo(memInfo)

        return mapOf(
            "totalRam" to memInfo.totalMem,
            "availableRam" to memInfo.availMem
        )
    }

    fun setStreamSink(sink: EventChannel.EventSink?) {
        streamSink = sink
    }

    fun setDownloadSink(sink: EventChannel.EventSink?) {
        downloadSink = sink
    }

    fun cleanup() {
        unloadModel()
    }
}
