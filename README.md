# Home-Assistant-Discord-bot

## Commands

Replace ! with your prefix  
() = Required   [] = Optional

* `!state (entity_id)` Shows the state of the entity
* `!light_on (entity_id without light.)` Turns the light on
* `!light_on_color (entity_id without "light.") (R) (G) (B) (Brightness)` Turns the light on with the given RGB values
* `!light_off (entity_id without light.)` Turns the light off
* `!switch_on (entity_id without switch.)` Turns the switch on
* `!switch_off (entity_id without switch.)` Turns the switch off
* `!alexa (message)` Says message through alexa. Installation: Look [Alexa](https://github.com/Minionflo/Home-Assistant-Discord-bot#alexa)

## Installation

### Requirments

* [Home Assistant](https://home-assistant.io)
* [Node.js](https://nodejs.org/en/)
* NPM
* [Alexa Media Player](https://github.com/custom-components/alexa_media_player) in Home Assistant (only if you want to use !alexa)
* [Docker](https://www.docker.com/)

### Installation

You must go into the folder with the files and then execute the following commands

* Make a Container with the Image minionflo/discord:homeassistant
* Set the Env variabels
  * `DC_TOKEN = Your discord token`
  * `DC_OWNER = Your discord id`
  * `DC_STATUS = The status of the bot`
  * `DC_STATUSTYPE = The type of the status`
  * `DC_PREFIX = The prefix of the message to listen to`
  * `DC_CHANNEL = The channel id of the channel to listen to`
  * `HA_TOKEN = Your Home Assistant Long-Lived-Access Tokens`
  * `HA_HOST = The url of your Home Assistant instance`
  * `HA_PORT = The port of your Home Assistant instance`
  * `HA_PROTOCOL = wss for Home Assistant with SSL, ws for Home Assistant without SSL`
* Start the Container

### Alexa

You need two helpers and one automation for !alexa to work

#### Helpers

1. Toggle Helper with the name: alexa_say
2. Text Helper with the name: alexa_say

#### Automation

Create an automation and open the automation yaml editor and paste in the code below

```alias: Alexa_Say
description: ''
trigger:
  - platform: state
    entity_id: input_boolean.alexa_say
    to: 'on'
condition: []
action:
  - service: notify.alexa_media_NAME
    data:
      data:
        type: tts
      target:
        - media_player.NAME
      message: '{{ states(''input_text.alexa_say'') }}'
  - service: input_boolean.turn_off
    data:
      entity_id: input_boolean.alexa_say
mode: single
```

Replace "NAME" with the name of your alexa
