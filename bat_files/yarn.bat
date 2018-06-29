:: Project: NASA Path in conjunction with University of Maryland University College
:: @author Nikki Florea
@ECHO off

:: reads cd txt and sets workingDir variable to the text it finds
SET /p workingDir=< cd.txt

:: sets title of command prompt
TITLE yarn

:: changes directory to workingDir variable
CD %workingDir%

:: writes command
CALL yarn

:: keeps terminal open
@PAUSE