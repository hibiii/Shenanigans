#!/bin/python3
# modbanks v2 by hibi
#
# Lets you switch a bank of mods on a multimc/polymc minecraft instance depending on the currently installed modloader.
# Code quality is of no concern
import json
from enum import Enum
import logging
import os
import sys
logging.basicConfig(level=logging.INFO)

class Loader(Enum):
	VANILLA = None
	FABRIC = {
		'name': 'Fabric',
		'directory': '/fabricmods',
		'website': 'https://fabricmc.net/'
	}
	QUILT = {
		'name': 'Quilt',
		'directory': '/quiltmods',
		'website': 'https://quiltmc.org/'
	}
	FORGE = {
		'name': 'Forge',
		'directory': '/forgemods',
		'website': 'https://minecraftforge.net/'
	}
	LITELOADER = {
		'name': 'LiteLoader',
		'directory': '/liteloadermods',
		'website': 'https://liteloader.com/'
	}

loaderRules = {
	'net.fabricmc.fabric-loader': Loader.FABRIC,
	'org.quiltmc.quilt-loader': Loader.QUILT,
	'net.minecraftforge': Loader.FORGE,
	'com.mumfrey.liteloader': Loader.LITELOADER
}

# Returns the currently installed mod loader by inspecting the mmc-pack file.
def getCurrentLoader(directory: str) -> Loader:
	with open(directory + '/mmc-pack.json', 'r') as packFile:
		data = json.loads(packFile.read())
	for component in data['components']:
		try:
			return loaderRules[component['uid']]
		except KeyError:
			continue
	return Loader.VANILLA

# Returns True if mod bank switching can safely be done
def validateModDirs(directory: str, active: Loader = None) -> bool:
	modsDir = directory + '/mods'
	if(os.path.exists(modsDir)):
		if(not os.path.islink(modsDir)):
			for dirpath, dirnames, files in os.walk(modsDir):
				if files:
					logging.fatal('"%s" directory and is full of files! abend', modsDir)
					return False
				break
	if(not active):
		return True
	loaderDir = directory + active.value['directory']
	if(not os.path.exists(loaderDir) or os.path.isfile(loaderDir)):
		logging.fatal('installed loader is %s but folder %s could not be found! abend', active.value['name'], loaderDir)
		return False
	return True

def needsReplacing(directory: str, active: Loader) -> bool:
	if(not os.path.exists(directory + '/mods') or not os.path.islink(directory + '/mods')):
		return True
	if(os.readlink(directory + '/mods') == directory + active.value['directory']):
		return False
	return True

def modsSwitcheroo(directory: str, active: Loader) -> None:
	modsdir = directory + '/mods'
	if(os.path.exists(modsdir)):
		if(os.path.islink(modsdir)):
			os.remove(modsdir)
		elif(os.path.isdir(modsdir)):
			os.rmdir(modsdir)
	os.symlink(dst = directory + '/mods', src = directory + active.value['directory'])

def main() -> int:
	if(sys.argv[1] != 'prelaunch'):
		logging.error('no operation given')
		os._exit(os.EX_NOINPUT)
	instDir = os.getenv('INST_DIR')
	mcDir = os.getenv('INST_MC_DIR')
	if(not instDir or not mcDir):
		logging.fatal('modbank is not being run in the cotext of a multimc/polymc custom command! abend')
		os._exit(os.EX_UNAVAILABLE)
	activeLoader = getCurrentLoader(instDir)
	if(activeLoader == Loader.VANILLA):
		logging.info('unrecognized loader or instance is vanilla, ignoring...')
		os._exit(os.EX_OK)
	if(not validateModDirs(mcDir, activeLoader)):
		os._exit(os.EX_CONFIG)
	if(needsReplacing(mcDir, activeLoader)):
		logging.info('Active loader is %s, switching banks', activeLoader.value['name'])
		modsSwitcheroo(mcDir, activeLoader)
	else:
		logging.info('Active loader is %s, /mods is already linked to %s', activeLoader.value['name'], activeLoader.value['directory'])
	logging.info('Clear!')
	os._exit(os.EX_OK)


if(__name__ == '__main__'):
	if(len(sys.argv) != 2):
		print('''Usage:
modbank prelaunch    - Switch mod banks
modbank instructions - Show more detailed instructions
modbank              - Show this lol

modbank MUST be run in the context of a multimc/polymc custom command.
modbank v2''')
		os._exit(os.EX_USAGE)
	if(sys.argv[1] == 'instructions'):
		print('''modbank MUST be run in the context of a MultiMC/PolyMC custom command. This is
detected by checking environment variables INST_DIR and INST_MC_DIR, which
MultiMC/PolyMC set automatically.

If your instance is synced across devices, with software such as syncthing,
you may wish to exclude the /mods folder as bank switching is made by using
symlinks.

                            -> -> BACKUP /mods <- <-

modbank removes /mods when switching banks. There are safeguards against
deleting /mods when it has files, but it's still good practice. If you're too
disk space constrained or lazy to make a backup, you can just rename /mods to
one of the loaders' directories. These directories are safe and will not get
touched by modbank (except for checking if they exist).

Supported mod loaders and their directories:''')
		for i in Loader:
			if(i.value == None):
				continue
			print(i.value['name'] + ' on ' + i.value['directory'] + ' (from ' + i.value['website'] + ')')
		os._exit(os.EX_USAGE)
	main()
