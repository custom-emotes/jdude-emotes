'use strict';
(() => {
	function main_init() {
		class JDude extends FrankerFaceZ.utilities.addon.Addon {
			constructor(...args) {
				super(...args);

				this.inject('settings');
				this.inject('chat');
				this.inject('chat.emotes');

				this.settings.add('jdude.enable_emoticons', {
					default: true,

					ui: {
						path: 'Add-Ons > JDude >> Emotes',
						title: 'Show Emotes',
						description: 'Enable to show JDude emotes.',
						component: 'setting-check-box',
					},
				});

				this.log.debug('JDude Emotes injected Correctly');
				this.chat.context.on('changed:jdude.enable_emoticons', this.updateEmotes, this);
				this.onEnable();
			}

			onEnable() {
				this.log.debug('JDude Emotes module was enabled successfully.');

				this.on('chat:room-add', this.roomAdd);
				this.on('chat:room-remove', this.roomRemove);

				this.updateEmotes();

			}

			roomAdd(room) {
				this.updateChannel(room);
			}

			roomRemove(room) {
				this.updateChannel(room);
			}

			async updateChannelEmotes(room, attempts = 0) {
				const realID = 'addon--jdude--emotes';
				room.removeSet('addon--jdude', realID);
				//this.emotes.unloadSet(realID);

				if (!this.chat.context.get('jdude.enable_emoticons')) {
					return;
				}

				const BASE_URL = "https://jdude-emotes.pages.dev/static/"
				const response = await fetch('https://jdude-emotes.pages.dev/emotes.json');
				if (response.ok) {
					const platyEmotes = [];

					for (const dataEmote of await response.json()) {

						const arbitraryEmote = /[^A-Za-z0-9]/.test(dataEmote.code);

						const emote = {
							id: dataEmote.code,
							urls: {
								1: undefined,
							},
							name: dataEmote.code,
							width: dataEmote.width,
							height: dataEmote.width,
							require_spaces: arbitraryEmote,
							modifier: dataEmote.modifier !== undefined,
							modifier_offset: dataEmote.modifier,
						};

						const filetype = (dataEmote.type === undefined ? "webp" : dataEmote.type); 

						emote.urls = {
							1: BASE_URL + `${dataEmote.id}` + "_28." + `${dataEmote.type}`,
							2: BASE_URL + `${dataEmote.id}` + "_56." + `${dataEmote.type}`,
							4: BASE_URL + `${dataEmote.id}` + "_112." + `${dataEmote.type}`,
						};


						platyEmotes.push(emote);
					}


					let setEmotes = [];
					setEmotes = setEmotes.concat(platyEmotes);

					let set = {
						emoticons: setEmotes,
						title: 'Channel Emotes',
						source: 'JDude',
						icon: 'https://jdude-emotes.pages.dev/static/icon.png',
					};
					room.addSet('addon--jdude', realID, set);

				} else {
					if (response.status === 404) return;

					const newAttempts = (attempts || 0) + 1;
					if (newAttempts < 12) {
						this.log.error('Failed to fetch global emotes. Trying again in 5 seconds.');
						setTimeout(this.updateChannelEmotes.bind(this, room, newAttempts), 5000);
					}
				}
			}

			async updateChannel(room) {
				const realID = 'addon--jdude--emotes';

				//console.log(room);
				if (room._id != 25118940) { //JDude Twitch ID
					//console.log("disabling JDude emotes")
					this.emotes.unloadSet('addon--jdude', realID);
				}
				else {
					//console.log("JDude emotes enabled")
					this.updateChannelEmotes(room);
					this.emotes.loadSet('addon--jdude', realID);

				}

			}

			updateEmotes() {
				for (const room of this.chat.iterateRooms()) {
					if (room) this.updateChannel(room);
				}
			}
		}

		JDude.register();
	}

	function checkExistance(attempts) {
		if (window.FrankerFaceZ) {
			main_init();
		} else {
			const newAttempts = (attempts || 0) + 1;
			if (newAttempts < 600)
				return setTimeout(checkExistance.bind(this, newAttempts), 100);
			console.warn(`Could not find FFZ.`);
		}
	}


	if (/^(?:player|im|chatdepot|tmi|api|spade|api-akamai|dev|)\./.test(window.location.hostname)) return;
	setTimeout(checkExistance.bind(this), 100);
})();