local config = {
    identifier = "???",
    side = "???",
    timeout = 1,
    cooldown = 0.2,
    returns = false,
    returnState = false,
    returnCooldown = 5
}

peripheral.find("modem", function(name, modem)
    if modem.isWireless() then
        rednet.open(name)
    end
end)

if not rednet.isOpen() then
    error("a wireless modem is required")
    shell.exit()
end

print("ARPS is now running...")

while true do
    os.pullEvent("redstone")
    rednet.broadcast(config.identifier .. " query", "arps")
    local id, mesg, protocol = rednet.receive("arps", config.timeout)
    if id then
        local mesgid, power = string.gmatch(mesg, "(%w+) (%w+)")()
        if mesgid == config.identifier then
            redstone.setOutput(config.side, power == "true")
        end
    end
    if config.returns then
        sleep(config.returnCooldown)
        redstone.setOutput(config.side, config.returnState)
    end
    sleep(config.cooldown)
end

print("Terminating!")
rednet.close()
