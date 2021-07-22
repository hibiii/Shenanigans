// Random Tick Wand for scarpet by hibi
// v1.0
// Right click any block with a raw iron to cause a single random tick to it!

__on_player_right_clicks_block(player, item_tuple, hand, block, face, hitvec) -> {
	player ~ 'sneaking' && return();
	item_tuple:0 == 'raw_iron' && {
		modify(player, 'swing', hand),
		random_tick(block) && particle('witch', block, 16, 0.3, 0.1) && sound('block.sculk_sensor.clicking_stop', block, 1, 1, 'block')
	}
}