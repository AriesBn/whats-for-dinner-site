package com.dinner.whatsfordinner.data.photo

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import dagger.hilt.android.qualifiers.ApplicationContext
import java.io.File
import java.io.FileOutputStream
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PhotoManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val picturesDir by lazy {
        File(context.filesDir, "pictures").apply {
            if (!exists()) mkdirs()
        }
    }

    companion object {
        private const val MAX_SIZE = 1080 // max dimension in pixels
        private const val JPEG_QUALITY = 80
    }

    /**
     * Save a photo from a Uri to internal storage.
     * Compresses to max 1080p.
     * Returns the relative path stored in the database.
     */
    fun savePhoto(sourceUri: Uri): String {
        val fileName = "${UUID.randomUUID()}.jpg"
        val destFile = File(picturesDir, fileName)

        val inputStream = context.contentResolver.openInputStream(sourceUri)
            ?: throw IllegalArgumentException("Cannot open URI: $sourceUri")

        // Decode with sample size for compression
        val options = BitmapFactory.Options().apply {
            inJustDecodeBounds = true
        }
        // Read bounds first
        val bitmap = BitmapFactory.decodeStream(inputStream)
        inputStream.close()

        // Calculate sample size to fit within MAX_SIZE
        val scaledBitmap = if (bitmap != null) {
            val ratio = maxOf(
                bitmap.width.toFloat() / MAX_SIZE,
                bitmap.height.toFloat() / MAX_SIZE
            )
            if (ratio > 1) {
                val newWidth = (bitmap.width / ratio).toInt()
                val newHeight = (bitmap.height / ratio).toInt()
                Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, true)
            } else {
                bitmap
            }
        } else {
            throw IllegalArgumentException("Failed to decode image")
        }

        if (scaledBitmap != bitmap) {
            bitmap.recycle()
        }

        FileOutputStream(destFile).use { out ->
            scaledBitmap.compress(Bitmap.CompressFormat.JPEG, JPEG_QUALITY, out)
        }
        scaledBitmap.recycle()

        // Store relative path, not full path
        return "pictures/$fileName"
    }

    fun deletePhoto(relativePath: String) {
        val file = File(context.filesDir, relativePath)
        if (file.exists()) {
            file.delete()
        }
    }

    fun getPhotoFile(relativePath: String): File {
        return File(context.filesDir, relativePath)
    }

    fun getPhotoUri(relativePath: String): Uri? {
        val file = File(context.filesDir, relativePath)
        return if (file.exists()) {
            Uri.fromFile(file)
        } else {
            null
        }
    }
}
