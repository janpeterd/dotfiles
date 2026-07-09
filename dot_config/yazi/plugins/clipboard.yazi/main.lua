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

local function get_mime_type(url)
	local out = Command("file")
		:arg({ "--brief", "--dereference", "--mime-type", "--", url })
		:output()
	if not out or not out.status.success then return nil end
	return out.stdout:match("^%s*(.-)%s*$")
end

local function copy_image(url, mime)
	local source, source_err = Command("cat")
		:arg({ "--", url })
		:stdout(Command.PIPED)
		:spawn()
	if not source then return false, source_err end

	local out, copy_err = Command("wl-copy")
		:arg({ "--type", mime })
		:stdin(source:take_stdout())
		:output()
	if not out then return false, copy_err end
	if not out.status.success then return false, out.stderr end
	return true
end

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

			if not h.is_dir then
				local mime = get_mime_type(h.url)
				if mime and mime:match("^image/") then
					local ok, err = copy_image(h.url, mime)
					if ok then
						ya.notify({ title = "Clipboard", content = h.url, timeout = 3 })
					else
						ya.notify({
							title = "Clipboard",
							content = "Could not copy image: " .. tostring(err),
							level = "error",
							timeout = 5,
						})
					end
					return
				end
			end

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
				if not utf8.len(text) then
					ya.notify({
						title = "Clipboard",
						content = "Only text and image contents can be copied",
						level = "warn",
						timeout = 3,
					})
					return
				end

				ya.clipboard(text)
				ya.notify({ title = "Clipboard", content = h.url, timeout = 3 })
			end
		end
	end,
}
