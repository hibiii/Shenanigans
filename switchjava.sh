#!/bin/bash
# switchjava, made by Hibi

# If you get an error that the condo isn't set do so here.
#
# The directory structure of the condo must be each Java home to be named its
# version number. For instance:
# <condo>/8, <condo>/11, <condo>/17
JAVA_CONDO=
# If I want Java 8, PATH will be set to <condo>/8/bin:$PATH, and JAVA_HOME will
# be overwritten with <condo>/8


# Check if the condo is set
if [ -z "$JAVA_CONDO" ]; then
	echo "Error: JAVA_CONDO isn't set. Please set it in \``which $0`\`."
	exit 1
fi



#Check if the condo is a directory
if [ ! -d "$JAVA_CONDO" ]; then
	echo "Error: JAVA_CONDO (\`${JAVA_CONDO}\`) isn't a directory."
	echo "Please change it it in \``which $0`\`."
	exit 1
fi



# Basic arg parsing
if [ -z "$1" ]; then
	echo "Usage: switchjava version command [command args]"
	echo "switchjava will search in ${JAVA_CONDO} for the specified version and set the correct environment variables before running the command."
	exit 1
fi



_new_java_home="${JAVA_CONDO}/${1}"
_new_path_element="${_new_java_home}/bin"

# More basic checks
if [ ! -d "${_new_java_home}" ]; then
	echo "Error: ${_new_java_home} isn't a directory."
	exit 1
fi

if [ ! -d "${_new_path_element}" ]; then
	echo "Error: ${_new_java_home} isn't a valid Java home (missing bin)."
	exit 1
fi

# Execution of the command
shift

export JAVA_HOME=${_new_java_home}
export PATH=${_new_path_element}:${PATH}
$@