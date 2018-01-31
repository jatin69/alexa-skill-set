@echo off
setlocal
:PROMPT
SET /P CONFIRM=Are you sure (y/n)? :
IF /I "%CONFIRM%" NEQ "Y" GOTO END


:: publish script starts

:: put your function name here exactly as is. No spaces.
set functionName=atlas-demo
del index.zip
cd lambda
:: also one way, 7z a -tzip index.zip .
7z a -r ..\index.zip *
cd ..
aws lambda update-function-code --function-name %functionName% --zip-file fileb://index.zip

:: publish script ends

:END
endlocal