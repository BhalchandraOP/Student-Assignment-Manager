@ECHO OFF
SETLOCAL
SET "PROJECT_BASE_DIR=%~dp0"
java "-Dmaven.multiModuleProjectDirectory=%PROJECT_BASE_DIR%." -classpath "%PROJECT_BASE_DIR%.mvn\wrapper\maven-wrapper.jar" org.apache.maven.wrapper.MavenWrapperMain %*
IF ERRORLEVEL 1 EXIT /B 1
ENDLOCAL
