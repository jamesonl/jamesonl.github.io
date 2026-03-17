#!/usr/bin/env ruby

require "cgi"
require "date"
require "openssl"
require "time"
require "yaml"

def parse_front_matter(path)
  source = File.read(path)
  match = source.match(/\A---\s*\n(.*?)\n---\s*\n/m)
  raise "Could not find YAML front matter in #{path}" unless match

  YAML.safe_load(match[1], permitted_classes: [Date, Time], aliases: true) || {}
end

if ARGV.empty?
  warn "Usage: ruby scripts/generate_vault_link.rb PATH_TO_COMPANY_PAGE [BASE_URL]"
  exit 1
end

path = ARGV[0]
base_url = (ARGV[1] || "https://jamesonl.github.io").sub(%r{/\z}, "")
secret = ENV["VAULT_SIGNING_KEY"]

unless secret && !secret.empty?
  warn "VAULT_SIGNING_KEY must be set in the environment."
  exit 1
end

front_matter = parse_front_matter(path)
slug = File.basename(path, File.extname(path))
configured_slug = front_matter["slug"]
token_id = front_matter["token_id"]

if configured_slug && configured_slug != slug
  warn "The front matter slug (#{configured_slug}) must match the file name (#{slug}) for Jekyll and signed links to stay aligned."
  exit 1
end

unless token_id && !token_id.empty?
  warn "The company page needs a token_id in its front matter."
  exit 1
end

expires_on = front_matter["expires_on"]
expires_at =
  if expires_on && !expires_on.to_s.empty?
    Time.parse(expires_on.to_s).to_i
  else
    Time.now.to_i + (14 * 24 * 60 * 60)
  end

request_path = "/vault/#{slug}/"
payload = "#{request_path}|#{token_id}|#{expires_at}"
signature = OpenSSL::HMAC.hexdigest("SHA256", secret, payload)

puts "#{base_url}#{request_path}?tid=#{CGI.escape(token_id)}&exp=#{expires_at}&sig=#{signature}"
