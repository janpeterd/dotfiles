local get_cwd = ya.sync(function()
	return tostring(cx.active.current.cwd)
end)

local get_uris = ya.sync(function()
	local urls = {}
	for _, u in ipairs(cx.active.selected) do
		urls[#urls + 1] = "file://" .. tostring(u)
	end
	if #urls == 0 then
		local h = cx.active.current.hovered
		if h then urls[1] = "file://" .. tostring(h.url) end
	end
	return urls
end)

local get_hovered = ya.sync(function()
	local h = cx.active.current.hovered
	if not h then return nil end
	return {
		url = tostring(h.url),
		is_dir = h.cha.is_dir,
	}
end)

return {
	entry = function(_, job)
		local action = job.args[1]

		if action == "cwd" then
			local cwd = get_cwd()
			ya.clipboard(cwd)
			ya.notify({ title = "Clipboard", content = cwd, timeout = 3 })

		elseif action == "uris" then
			local urls = get_uris()
			if #urls > 0 then
				ya.clipboard(table.concat(urls, "\n"))
			end

		elseif action == "contents" then
			local h = get_hovered()
			if not h then return end

			local text
			if h.is_dir then
				local out = Command("ls"):arg({ h.url }):output()
				if out then text = out.stdout end
			else
				local f = io.open(h.url, "rb")
				if f then
					text = f:read("*a")
					f:close()
				end
			end

			if text then
				ya.clipboard(text)
				ya.notify({ title = "Clipboard", content = h.url, timeout = 3 })
			end
		end
	end,
}
