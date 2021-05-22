// rituals for carpet by hibi
// probably will only give effects for 4bi ticks or smth 

// TYPE `ruleset`:
// `rules`: an array of coordinate tuples, of offsets to each block, starting
//          from the north-west corner of a pattern.
// `blockName`: a string to match block names with. Does not need to be a
//              strict name ('_wool' will do for any wool block).
// `blockTags`: an array of ['key', 'value'] pairs of block state tags, optional.
__config() ->
{
	'scope' -> 'global',
	'stay_loaded' -> true
};

global_rituals =
{
	'candles' -> {
		'rules' -> [[2, 0, 0],[0, 0, 2], [4, 0, 2], [1, 0, 4], [3, 0, 4]],
		'blockName' -> 'candle',
		'blockTags' -> [
			['lit', true]
		]
	},
	'dust_dots' -> {
		'rules' -> [[1,0,0], [3,0,0], [0,0,1], [4,0,1], [0,0,3], [4,0,3], [2, 0, 4]],
		'blockName' -> 'redstone_wire',
		'blockTags' -> [
			['north', 'none'],
			['east', 'none'],
			['west', 'none'],
			['south', 'none']
		]
	},
	'lines' -> [
		// pentagram
		[[2.5,0,0.5], [3.5,0,4.5]],
		[[3.5,0,4.5], [0.5,0,2.5]],
		[[0.5,0,2.5], [4.5,0,2.5]],
		[[4.5,0,2.5], [1.5,0,4.5]],
		[[1.5,0,4.5], [2.5,0,0.5]],

		// outline
		[[1.5,0,0.5], [3.5,0,0.5]], [[3.5,0,0.5], [4.5,0,2.5]],
		[[4.5,0,2.5], [3.5,0,4.5]], [[3.5,0,4.5], [1.5,0,4.5]],
		[[1.5,0,4.5], [0.5,0,2.5]], [[0.5,0,2.5], [1.5,0,0.5]]
	],
	'sacrifices' -> [
		['nether_star', 'blaze_powder', 'blaze_rod', 'ghast_tear', 'golden_apple'],
		['wither_rose', 'iron_ingot']
	],
	'awards' -> [
		_(player, pos) -> {
			if(player_wears_armor(player)
			|| (entity_area('player', pos + [2, 0, 2], [1.5, 1, 1.5]) ~ player == null),
				destroyCircles(player, pos, true)
			,
				if(query(player, 'effect', 'weakness') == null,
					modify(player, 'effect', 'instant_damage', 1, 1)
				);
				modify(player, 'effect', 'fire_resistance', 2147483647, 0, false, false);
				sound('entity.blaze.ambient',pos(player),1, 1, 'player');
				sound('block.respawn_anchor.set_spawn', pos + [2, 0, 2], 0.5, 1, 'ambient');
			);
		},
		_(player, pos) -> {
			print(player('all'), 'yay!')
		}
	],
	'timeOpen' -> 5400, // Thirds-of-seconds a circle stays open 
	'timeComplete' -> 45, // Thirds-of-seconds a circle plays its "done" animation
	'circles' -> {}
};

__on_player_right_clicks_block(player, item_tuple, hand, block, face, hitvec) ->
{
	block ~ 'candle' && (item_tuple ~ 'flint_and_steel' || 'fire_charge' != null) && block_state(pos(block), 'lit') == false &&
		schedule(15, 'makePattern', pos(block), player);
};

__on_player_changes_dimension(player, from_pos, from_dimension, to_pos, to_dimension) -> { destroyCircles(player, null, false) };
__on_player_disconnects(player, reason) -> { destroyCircles(player, null, false) };
__on_player_dies(player) -> { destroyCircles(player, null, true) };

// Tick the circles
// Tick only every ⅓ of a second to reduce lag (every 6 ticks)
__on_tick() ->
{
	if(tick_time() % 6 == 0,
		for(global_rituals:'circles', in_dimension(_,
			// basic nomenclature
			circle = global_rituals:'circles':_;
			position = circle:'pos';
			player = _;
			// integrity check
			if(! isPatternCompleted(position + [2, 0, 0]),
				closeCircle(player);
				delete(global_rituals:'circles':player);
				break();
			);
			circle:'tic' += -1;
			if(circle:'don',
				// if the circle is done, complete
				if(circle:'tic' <= 0,
					for(global_rituals:'dust_dots':'rules',
						if(block(circle:'pos' + _) ~ (global_rituals:'dust_dots':'blockName'),
							set(circle:'pos' + _, 'air');
						);
					);
					sound('entity.zombie_villager.converted', position + [2, 0, 2], 1, 1, 'ambient');
					call(global_rituals:'awards':(circle:'rit'), player, position);
					delete(global_rituals:'circles':_);
				);
				for(global_rituals:'lines',
					particle_line('witch', position + _:0, position + _:1, 1);
				);
				particle('witch', pos(player) + [0, 1, 0], 2);
			, // else //
				// timeout
				if(circle:'tic' <= 0,
					closeCircle(_);
					sound('block.respawn_anchor.set_spawn', position + [2, 0, 2], 1, 1, 'ambient');
					delete(global_rituals:'circles':_);
					break;
				);
				// cosmetics
				for(global_rituals:'lines',
					particle_line('dust 0.8 0 1 1', position + _:0, position + _:1, 1);
				);
				// Current implementation should *very* laggy (O(N²)), so don't run it very often
				if(tick_time() % 18 == 0,
					e = [];
					for(entity_area('item', position + [2, 0, 2], [2, 1, 2]),
						e += query(_, 'item'):0
					);
					for(global_rituals:'sacrifices',
						listLen = length(_);
						if(length(e) == listLen,
							tempList = copy(_);
							for(tempList,
								if(e ~ _ != null, delete(tempList, tempList ~ _));
							);
							if(!tempList,
								for(entity_area('item', position + [2, 0, 2], [2, 1, 2]),
									particle('dust 0 0 0 10', pos(_) + [0, 0.5, 0], 10);
									modify(_, 'remove');
								);
								sound('entity.zombie.infect', position + [2, 0, 2], 1, 1, 'ambient');
								circle:'don' = true;
								circle:'rit' = _i;
								circle:'tic' = global_rituals:'timeComplete';
							);
						);
					);
				);
			);
		););
	);
};

makePattern(pos, player) -> {
	patternOrigin = isPatternCompleted(pos);
	if(patternOrigin,
		registerCircle(player, patternOrigin);
	);
};

// Checks if a "circle" can be found here by observing the rulesets.
isPatternCompleted(pos) ->
{
	patternOrigin = patternRulesetCompleted(pos, global_rituals:'candles');
	if(patternOrigin
	&& patternRulesetCompleted(patternOrigin + global_rituals:'dust_dots':'rules':0, global_rituals:'dust_dots'),
		return(patternOrigin);
	);
	return(null);
};

// Checks if a pattern ruleset is being followed (O(n²)).
// returns: the north-west corner of the pattern if successful, or null if ruleset not observed.
patternRulesetCompleted(pos, ruleset) -> {
	for(ruleset:'rules',
		fakeOrigin = pos - _;
		checkedItems = 0;
		for(ruleset:'rules',
			possy = fakeOrigin + _;
			if(block(possy) ~ (ruleset:'blockName')
			&& block_state(possy) == {}
			|| for(ruleset:'blockTags', pairs(block_state(possy)) ~ _ > 0),
				checkedItems += 1;
			);
		);
		if(checkedItems == length(ruleset:'rules'),
			return(fakeOrigin);
		);
	);
	return(null);
};

// Check for item sacrifices


// Registers a circle to track afterwards.
registerCircle(player, position) ->
{
	if(destroyCircles(player, position, true), return(););
	put(global_rituals:'circles':player,
		m(
			['pos', position],
			['dim', query(player, 'dimension')],
			['tic', global_rituals:'timeOpen'],
			['don', false]));
	sound('entity.zombie_villager.cure', position + [2, 0, 2], 1, 0.7, 'ambient');
	sound('item.trident.thunder', position + [2, 0, 2], 1, 1, 'ambient');
	spawn('lightning_bolt', position + [2.5, -0.5, 2.5]);
};

// Violently destroys any circles and also the player
destroyCircles(player, position, killPlayer) ->
{
	if(global_rituals:'circles':player,
		in_dimension(global_rituals:'circles':player:'dim',
			create_explosion(global_rituals:'circles':player:'pos' + [2,0,2], 6, 'destroy', true, null, player(player));
		);
		delete(global_rituals:'circles':player);
		if(position,
			create_explosion(position  + [2,0,2], 6, 'destroy', true, null, player(player));
		);
		if(killPlayer,
			create_explosion(pos(player), 6, 'destroy', true, null, player(player));
		);
		return(true);
	);
	return(false);
};

// Gently closes any circles for a player
closeCircle(player) ->
{
	for(global_rituals:'candles':'rules',
		if(block(global_rituals:'circles':player:'pos' + _) ~ (global_rituals:'candles':'blockName'),
			destroy(global_rituals:'circles':player:'pos' + _);
		);
	);
	for(global_rituals:'dust_dots':'rules',
		if(block(global_rituals:'circles':player:'pos' + _) ~ (global_rituals:'dust_dots':'blockName'),
			destroy(global_rituals:'circles':player:'pos' + _);
		);
	);
};

// Pattern
//    . * .
//  .       .
//  *       *
//  .       .
//    * . *
// *: Candle
// .: Redstone dust dot

player_wears_armor(player) -> {
	inv = inventory_get('equipment', player);
	return(inv:1 || inv:2 || inv:3 || inv:4);
};
