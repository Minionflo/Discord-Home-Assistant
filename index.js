const fs            = require('fs')
const Discord       = require('discord.js')
const Homeassistant = require('node-homeassistant')

var config_dc_token = process.env.DC_TOKEN
var config_dc_owner = process.env.DC_OWNER
var config_dc_status = process.env.DC_STATUS
var config_dc_statustype = process.env.DC_STATUSTYPE
var config_dc_prefix = process.env.DC_PREFIX
var config_dc_channel = process.env.DC_CHANNEL
var config_ha_token = process.env.HA_TOKEN
var config_ha_host = process.env.HA_HOST
var config_ha_port = process.env.HA_PORT
var config_ha_protocol = process.env.HA_PROTOCOL
//var config_ha_alexa = process.env.HA_ALEXA

var client = new Discord.Client()

let ha = new Homeassistant({
    host: config_ha_host,
    protocol: config_ha_protocol, // "ws" (default) or "wss" for SSL
    retryTimeout: 5000, // in ms, default is 5000
    retryCount: -1, // default is 10, values < 0 mean unlimited
    token: config_ha_token,
    port: config_ha_port
})

client.on('ready', () => {
    activity()
    setInterval(activity, 60000)
    console.log(`Online`)
    ha.connect()
})

function activity() {
    client.user.setActivity(config_dc_status, {type: config_dc_statustype})
}

var con
var conn
ha.on('connection', info => {
    //console.log(info)
    setTimeout(function(){ 
        console.log(info)
    if(info == "authenticated") {
        conn = setTimeout(function(){client.user.setStatus('online');}, 1000)
        conn
        clearTimeout(con)
    } else {
        con = setTimeout(function(){client.user.setStatus('dnd');}, 1000)
        con
    }
}, 200)
})

var cmdmap = {
    alexa : cmd_alexa,
    state : cmd_state,
    light_on : cmd_light_on,
    light_on_color : cmd_light_on_color,
    light_off : cmd_light_off,
    switch_on : cmd_switch_on,
    switch_off : cmd_switch_off
}

function cmd_alexa(msg, args) {
    if(args == "") {
        client.channels.cache.get(config_dc_channel).send("You have to provide args")
    }
    else if (msg.author.id == config_dc_owner) {
    args = args.join(" ")
        ha.call({
            domain: 'input_text',
            service: 'set_value',
            service_data: {
                "entity_id": "input_text.alexa_say",
                "value": args.toString()
            }
        })
        ha.call({
            domain: 'input_boolean',
            service: 'turn_on',
            service_data: {
                "entity_id": "input_boolean.alexa_say"
            }
        })
        client.channels.cache.get(config_dc_channel).send("Said")
    }
}
function cmd_state(msg, args) {
    if(args == "") {
        client.channels.cache.get(config_dc_channel).send("You have to provide args")
    }
    else if (msg.author.id == config_dc_owner) {
    args = args.join(" ")
    args = args.toString()
    var state = ha.state(args) 
    var state = JSON.stringify(state)
    var state = JSON.parse(state)
    
    client.channels.cache.get(config_dc_channel).send(state.state)
    }
}
function cmd_light_on(msg, args) {
    if(args == "") {
        client.channels.cache.get(config_dc_channel).send("You have to provide args")
    }
    else if (msg.author.id == config_dc_owner) {
        ha.call({
            domain: 'light',
            service: 'turn_on',
            service_data: {
                "entity_id": "light." + args
            }
        })
        client.channels.cache.get(config_dc_channel).send("Turned "+ args + " on")
    }
}
function cmd_light_on_color(msg, args) {
    if(args == "") {
        client.channels.cache.get(config_dc_channel).send("You have to provide args")
    }
    else if (msg.author.id == config_dc_owner) {
        ha.call({
            domain: 'light',
            service: 'turn_on',
            service_data: {
                "entity_id": "light." + args[0],
                "rgb_color":  `[${args[1]}, ${args[2]}, ${args[3]}]`,
                "brightness": args[4]
            }
        })
        client.channels.cache.get(config_dc_channel).send("Turned "+ args[0] + " on and set the color " + args[1] + " " + args[2] + " " + args[3] + " and the brightness " + args[4])
    }
}
function cmd_light_off(msg, args) {
    if(args == "") {
        client.channels.cache.get(config_dc_channel).send("You have to provide args")
    }
    else if (msg.author.id == config_dc_owner) {
        ha.call({
            domain: 'light',
            service: 'turn_off',
            service_data: {
                "entity_id": "light." + args
            }
        })
        client.channels.cache.get(config_dc_channel).send("Turned "+ args + " off")
    }
}
function cmd_switch_on(msg, args) {
    if(args == "") {
        client.channels.cache.get(config_dc_channel).send("You have to provide args")
    }
    else if (msg.author.id == config_dc_owner) {
        ha.call({
            domain: 'switch',
            service: 'turn_on',
            service_data: {
                "entity_id": "switch." + args
            }
        })
        client.channels.cache.get(config_dc_channel).send("Turned "+ args + " on")
    }
}
function cmd_switch_off(msg, args) {
    if(args == "") {
        client.channels.cache.get(config_dc_channel).send("You have to provide args")
    }
    else if (msg.author.id == config_dc_owner) {
        ha.call({
            domain: 'switch',
            service: 'turn_off',
            service_data: {
                "entity_id": "switch." + args
            }
        })
        client.channels.cache.get(config_dc_channel).send("Turned "+ args + " off")
    }
}

client.on('message', (msg) => {
    var cont   = msg.content,
        member = msg.member,
        chan   = msg.channel,
        guild  = msg.guild,
        author = msg.author

        if (author.id != client.user.id && cont.startsWith(config_dc_prefix)) {

            
            // 
            var invoke = cont.split(' ')[0].substr(config_dc_prefix.length),
                args   = cont.split(' ').slice(1)
            
            
            if (invoke in cmdmap) {
                cmdmap[invoke](msg, args)
            }
        }

})

client.login(config_dc_token)