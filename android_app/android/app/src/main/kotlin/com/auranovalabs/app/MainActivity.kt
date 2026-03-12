package com.auranovalabs.app

import android.os.Bundle
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import io.flutter.plugin.common.EventChannel
import com.auranovalabs.app.channels.AIChannel

class MainActivity : FlutterActivity() {
    private val AI_CHANNEL = "com.auranovalabs/ai"
    private val AI_STREAM_CHANNEL = "com.auranovalabs/ai_stream"
    private val DOWNLOAD_CHANNEL = "com.auranovalabs/download_progress"

    private lateinit var aiChannel: AIChannel

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        // Initialize AI Channel
        aiChannel = AIChannel(this)

        // Set up Method Channel for AI operations
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, AI_CHANNEL)
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "loadModel" -> {
                        val modelName = call.argument<String>("name") ?: ""
                        val success = aiChannel.loadModel(modelName)
                        result.success(success)
                    }
                    "generate" -> {
                        val prompt = call.argument<String>("prompt") ?: ""
                        val maxTokens = call.argument<Int>("maxTokens") ?: 512
                        val temperature = call.argument<Double>("temperature") ?: 0.7
                        
                        Thread {
                            try {
                                val response = aiChannel.generate(prompt, maxTokens, temperature)
                                runOnUiThread { result.success(response) }
                            } catch (e: Exception) {
                                runOnUiThread { result.error("GENERATION_ERROR", e.message, null) }
                            }
                        }.start()
                    }
                    "unloadModel" -> {
                        aiChannel.unloadModel()
                        result.success(null)
                    }
                    "getModels" -> {
                        result.success(aiChannel.getAvailableModels())
                    }
                    "getMemoryInfo" -> {
                        result.success(aiChannel.getMemoryInfo())
                    }
                    "downloadModel" -> {
                        val modelId = call.argument<String>("modelId") ?: ""
                        aiChannel.downloadModel(modelId) { progress ->
                            // Progress is handled via EventChannel
                        }
                        result.success(null)
                    }
                    else -> result.notImplemented()
                }
            }

        // Set up Event Channel for streaming generation
        EventChannel(flutterEngine.dartExecutor.binaryMessenger, AI_STREAM_CHANNEL)
            .setStreamHandler(object : EventChannel.StreamHandler {
                override fun onListen(arguments: Any?, events: EventChannel.EventSink?) {
                    aiChannel.setStreamSink(events)
                }

                override fun onCancel(arguments: Any?) {
                    aiChannel.setStreamSink(null)
                }
            })

        // Set up Event Channel for download progress
        EventChannel(flutterEngine.dartExecutor.binaryMessenger, DOWNLOAD_CHANNEL)
            .setStreamHandler(object : EventChannel.StreamHandler {
                override fun onListen(arguments: Any?, events: EventChannel.EventSink?) {
                    aiChannel.setDownloadSink(events)
                }

                override fun onCancel(arguments: Any?) {
                    aiChannel.setDownloadSink(null)
                }
            })
    }

    override fun onDestroy() {
        aiChannel.cleanup()
        super.onDestroy()
    }
}
