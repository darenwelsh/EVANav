:: Project: NASA Path in conjunction with University of Maryland University College
:: @author Nikki Florea
@ECHO off

:: prints current directory to cd.txt
@ECHO %cd%> bat_files/cd.txt

:: opens a command prompt and runs yarn.bat
START cmd /k call bat_files/yarn.bat

:: opens a command prompt and runs yarn_start.bat
START cmd /k call bat_files/yarn_start.bat

:: opens a command prompt and runs yarn_compile.bat
START cmd /k call bat_files/yarn_compile.bat

:: delay
ping timeout -n 9 >nul 2>&1

:: opens chrome at specified location
START chrome http://127.0.0.1:3000/

:: delay
ping timeout -n 5 >nul 2>&1

:: refreshes page
bat_files/refresh.vbs