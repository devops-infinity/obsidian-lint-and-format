#!/usr/bin/env bash
set -Eeuo pipefail

readonly SCRIPT_PATH="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="${SCRIPT_PATH}"

SPINNER_PID=""
CURRENT_LOG_FILE=""

if [[ -t 1 ]]; then
  readonly COLOR_RESET=$'\033[0m'
  readonly COLOR_INFO=$'\033[36m'
  readonly COLOR_SUCCESS=$'\033[32m'
  readonly COLOR_WARN=$'\033[33m'
  readonly COLOR_FAIL=$'\033[31m'
  readonly COLOR_BOLD=$'\033[1m'
  readonly USE_UNICODE_SPINNER=1
else
  readonly COLOR_RESET=""
  readonly COLOR_INFO=""
  readonly COLOR_SUCCESS=""
  readonly COLOR_WARN=""
  readonly COLOR_FAIL=""
  readonly COLOR_BOLD=""
  readonly USE_UNICODE_SPINNER=0
fi

log_info() {
  printf '%s[INFO]%s %s\n' "${COLOR_INFO}" "${COLOR_RESET}" "$*"
}

log_success() {
  printf '%s[SUCCESS]%s %s\n' "${COLOR_SUCCESS}" "${COLOR_RESET}" "$*"
}

log_warn() {
  printf '%s[WARNING]%s %s\n' "${COLOR_WARN}" "${COLOR_RESET}" "$*"
}

log_fail() {
  printf '%s[FAILED]%s %s\n' "${COLOR_FAIL}" "${COLOR_RESET}" "$*" >&2
}

spinner_start() {
  local message="$1"
  local unicode_frames=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
  local ascii_frames=('/' '-' '\' '|')

  if [[ ! -t 1 ]]; then
    log_info "${message}..."
    SPINNER_PID=""
    return 0
  fi

  (
    local i=0
    local frames_count
    if [[ "${USE_UNICODE_SPINNER}" -eq 1 ]]; then
      frames_count=${#unicode_frames[@]}
    else
      frames_count=${#ascii_frames[@]}
    fi

    while true; do
      local frame
      if [[ "${USE_UNICODE_SPINNER}" -eq 1 ]]; then
        frame="${unicode_frames[$((i % frames_count))]}"
      else
        frame="${ascii_frames[$((i % frames_count))]}"
      fi
      printf '\r%s[INFO]%s %s %s ' "${COLOR_INFO}" "${COLOR_RESET}" "${frame}" "${message}"
      sleep 0.1
      ((i++))
    done
  ) &
  SPINNER_PID=$!
  disown "${SPINNER_PID}" 2>/dev/null || true
}

spinner_stop() {
  if [[ -n "${SPINNER_PID}" ]] && kill -0 "${SPINNER_PID}" 2>/dev/null; then
    kill "${SPINNER_PID}" 2>/dev/null || true
    wait "${SPINNER_PID}" 2>/dev/null || true
    if [[ -t 1 ]]; then
      printf '\r%*s\r' 100 ''
    fi
  fi
  SPINNER_PID=""
}

on_error() {
  local exit_code=$?
  local line_no=$1
  spinner_stop
  log_fail "Error on line ${line_no} (exit code ${exit_code})"
  if [[ -n "${CURRENT_LOG_FILE}" ]] && [[ -f "${CURRENT_LOG_FILE}" ]]; then
    log_fail "See log: ${CURRENT_LOG_FILE}"
  fi
  exit "${exit_code}"
}

on_exit() {
  spinner_stop
}

trap 'on_error ${LINENO}' ERR
trap 'on_exit' EXIT
trap 'spinner_stop; exit 130' INT TERM

require_file() {
  local file="$1"
  local label="$2"
  if [[ ! -f "${REPO_ROOT}/${file}" ]]; then
    log_fail "${label} not found"
    exit 1
  fi
}

require_command() {
  local cmd="$1"
  local label="$2"
  if ! command -v "${cmd}" >/dev/null 2>&1; then
    log_fail "${label} not installed"
    exit 1
  fi
}

is_newer_than_dir() {
  local file="$1"
  local dir="$2"

  if [[ ! -e "${file}" ]] || [[ ! -d "${dir}" ]]; then
    return 1
  fi

  local file_mtime dir_mtime
  file_mtime=$(stat -f %m "${file}" 2>/dev/null || stat -c %Y "${file}" 2>/dev/null || echo 0)
  dir_mtime=$(stat -f %m "${dir}" 2>/dev/null || stat -c %Y "${dir}" 2>/dev/null || echo 0)

  [[ "${file_mtime}" -gt "${dir_mtime}" ]]
}

run_with_spinner() {
  local message="$1"
  local success_message="$2"
  local failure_message="$3"
  shift 3
  local cmd=("$@")

  local log_file
  log_file=$(mktemp -t "obsidian-lint-and-format.XXXXXX")
  CURRENT_LOG_FILE="${log_file}"

  spinner_start "${message}"

  set +e
  "${cmd[@]}" >"${log_file}" 2>&1
  local exit_code=$?
  set -e

  spinner_stop

  if [[ "${exit_code}" -ne 0 ]]; then
    log_fail "${failure_message} — see ${log_file}"
    printf -- '---- last 30 lines of log ----\n' >&2
    tail -n 30 "${log_file}" >&2
    printf -- '------------------------------\n' >&2
    CURRENT_LOG_FILE=""
    exit "${exit_code}"
  fi

  rm -f "${log_file}"
  CURRENT_LOG_FILE=""
  log_success "${success_message}"
}

human_size() {
  local file="$1"
  du -h "${file}" 2>/dev/null | cut -f1
}

relocate_node_modules_if_inside_icloud() {
  local plugin_path="${REPO_ROOT}"
  if [[ "${plugin_path}" != *"/Documents/"* ]] && [[ "${plugin_path}" != *"/Desktop/"* ]]; then
    return 0
  fi

  if [[ -L "${REPO_ROOT}/node_modules" ]]; then
    log_info "node_modules already symlinked (outside iCloud sync path)"
    return 0
  fi

  local cache_root="${HOME}/Library/Caches/obsidian-lint-and-format-build"
  mkdir -p "${cache_root}"

  if [[ -d "${REPO_ROOT}/node_modules" ]]; then
    log_warn "node_modules is inside iCloud-synced Documents — relocating to ${cache_root}"
    mv "${REPO_ROOT}/node_modules" "${cache_root}/node_modules"
    ln -s "${cache_root}/node_modules" "${REPO_ROOT}/node_modules"
    log_success "node_modules relocated and symlinked"
  else
    ln -s "${cache_root}/node_modules" "${REPO_ROOT}/node_modules"
    log_info "Created node_modules symlink to ${cache_root}/node_modules"
  fi
}

main() {
  cd "${REPO_ROOT}"

  log_info "Repository: ${REPO_ROOT}"

  require_file "package.json" "package.json"
  require_file "manifest.json" "manifest.json"
  require_file "esbuild.config.mjs" "esbuild.config.mjs"

  require_command "node" "Node.js"
  require_command "npm" "npm"

  local node_version npm_version
  node_version=$(node --version 2>/dev/null)
  npm_version=$(npm --version 2>/dev/null)
  log_info "Node.js: ${node_version}"
  log_info "npm: ${npm_version}"

  relocate_node_modules_if_inside_icloud

  local needs_install=0
  if [[ ! -e "${REPO_ROOT}/node_modules" ]]; then
    needs_install=1
  elif [[ -L "${REPO_ROOT}/node_modules" ]] && [[ ! -d "$(readlink "${REPO_ROOT}/node_modules")" ]]; then
    needs_install=1
  elif [[ -f "${REPO_ROOT}/package-lock.json" ]] && is_newer_than_dir "${REPO_ROOT}/package-lock.json" "${REPO_ROOT}/node_modules"; then
    needs_install=1
  fi

  if [[ "${needs_install}" -eq 1 ]]; then
    run_with_spinner \
      "Installing dependencies (npm install)" \
      "Dependencies installed" \
      "npm install failed" \
      npm install
  else
    log_info "Dependencies already installed — skipping npm install"
  fi

  run_with_spinner \
    "Building plugin (npm run build)" \
    "Build completed" \
    "Build failed" \
    npm run build

  local main_js="${REPO_ROOT}/main.js"
  if [[ ! -f "${main_js}" ]]; then
    log_fail "main.js was not produced"
    exit 1
  fi

  local main_size_bytes
  main_size_bytes=$(stat -f %z "${main_js}" 2>/dev/null || stat -c %s "${main_js}" 2>/dev/null || echo 0)
  if [[ "${main_size_bytes}" -le 0 ]]; then
    log_fail "main.js was not produced"
    exit 1
  fi

  local main_size_human
  main_size_human=$(human_size "${main_js}")
  log_success "main.js generated (${main_size_human})"

  local plugin_id plugin_version
  plugin_id=$(node -p "require('${REPO_ROOT}/manifest.json').id" 2>/dev/null || echo "unknown")
  plugin_version=$(node -p "require('${REPO_ROOT}/manifest.json').version" 2>/dev/null || echo "unknown")

  local elapsed="${SECONDS}"

  printf '\n'
  printf '%s========== Build Summary ==========%s\n' "${COLOR_BOLD}" "${COLOR_RESET}"
  log_info "Plugin id: ${plugin_id}"
  log_info "Plugin version: ${plugin_version}"
  log_info "Total runtime: ${elapsed}s"
  log_info "Next: In Obsidian, disable then re-enable \"Lint & Format\" under Settings → Community plugins."
  printf '%s===================================%s\n' "${COLOR_BOLD}" "${COLOR_RESET}"

  log_success "Plugin build pipeline complete"
}

main "$@"
