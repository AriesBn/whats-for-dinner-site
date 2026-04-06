#!/bin/bash
# Download Gradle wrapper JAR
WRAPPER_JAR="$PWD/gradle/wrapper/gradle-wrapper.jar"
if [ ! -f "$WRAPPER_JAR" ]; then
    echo "Downloading gradle-wrapper.jar..."
    curl -L -o "$WRAPPER_JAR" "https://raw.githubusercontent.com/gradle/gradle/v8.2.0/gradle/wrapper/gradle-wrapper.jar"
    echo "Done: $WRAPPER_JAR ($(wc -c < "$WRAPPER_JAR") bytes)"
fi
