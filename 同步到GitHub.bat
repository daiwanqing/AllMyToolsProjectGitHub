@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion

rem 该脚本只能由用户手动双击执行；项目没有自动推送钩子或定时同步任务。
set "REPO_ROOT=%~dp0"
set "EXPECTED_BRANCH=dev"
set "EXPECTED_ORIGIN_URL=https://git.code.tencent.com/AIGameProjects/AllMyToolsProject.git"
set "EXPECTED_GITHUB_URL=https://github.com/daiwanqing/AllMyToolsProjectGitHub.git"

cd /d "%REPO_ROOT%" || goto :failed

where git.exe >nul 2>nul
if errorlevel 1 (
  echo 未找到 Git，请先安装 Git for Windows。
  goto :failed
)

if not exist "package.json" (
  echo 未找到 package.json。请确认脚本位于 AllMyToolsProject 仓库根目录。
  goto :failed
)

for /f "delims=" %%A in ('git branch --show-current 2^>nul') do set "CURRENT_BRANCH=%%A"
if /i not "!CURRENT_BRANCH!"=="%EXPECTED_BRANCH%" (
  echo 当前分支是 [!CURRENT_BRANCH!]，不是唯一允许同步的 [dev]，已停止。
  goto :failed
)

for /f "delims=" %%A in ('git remote get-url origin 2^>nul') do set "ACTUAL_ORIGIN_URL=%%A"
if /i not "!ACTUAL_ORIGIN_URL!"=="%EXPECTED_ORIGIN_URL%" (
  echo 工蜂远程地址不匹配，已停止：
  echo 期望：%EXPECTED_ORIGIN_URL%
  echo 当前：!ACTUAL_ORIGIN_URL!
  goto :failed
)

git diff --name-only --diff-filter=U | findstr /r /c:"." >nul
if not errorlevel 1 (
  echo 当前仓库存在未解决的本地合并冲突（不是 GitHub 同步冲突），为避免丢失开发内容已停止。
  echo 请先在工蜂开发目录完成或撤销这次本地合并，再重新运行本脚本。
  goto :failed
)

echo.
echo ===== AllMyTools 手动同步 =====
echo 开发目录：%CD%
echo 开发分支：dev
echo 工蜂：%EXPECTED_ORIGIN_URL%
echo GitHub：%EXPECTED_GITHUB_URL%
echo.
echo 当前改动：
git status --short

set "HAS_CHANGES="
for /f "delims=" %%A in ('git status --porcelain 2^>nul') do set "HAS_CHANGES=1"
if defined HAS_CHANGES (
  call :confirm "检测到本地改动。是否将全部改动提交到工蜂 dev？"
  if errorlevel 1 goto :cancelled

  set "COMMIT_MESSAGE="
  set /p "COMMIT_MESSAGE=请输入本次提交说明（不能为空）："
  if not defined COMMIT_MESSAGE (
    echo 提交说明不能为空，已停止。
    goto :failed
  )

  git add -A
  if errorlevel 1 goto :failed
  git commit -m "!COMMIT_MESSAGE!"
  if errorlevel 1 goto :failed
) else (
  echo 没有未提交的本地改动，将同步当前 dev 提交。
)

call :confirm "是否推送当前 dev 到腾讯工蜂 origin/dev？"
if errorlevel 1 goto :cancelled
git push origin dev
if errorlevel 1 (
  echo 推送到工蜂失败，GitHub 未执行推送。
  goto :failed
)

git remote get-url github >nul 2>nul
if errorlevel 1 (
  echo 尚未配置 GitHub 远程地址：%EXPECTED_GITHUB_URL%
  call :confirm "是否添加这个 GitHub 远程地址？"
  if errorlevel 1 goto :cancelled
  git remote add github "%EXPECTED_GITHUB_URL%"
  if errorlevel 1 goto :failed
)

set "ACTUAL_GITHUB_URL="
for /f "delims=" %%A in ('git remote get-url github 2^>nul') do set "ACTUAL_GITHUB_URL=%%A"
if /i not "!ACTUAL_GITHUB_URL!"=="%EXPECTED_GITHUB_URL%" (
  echo GitHub 远程地址不匹配，已停止：
  echo 期望：%EXPECTED_GITHUB_URL%
  echo 当前：!ACTUAL_GITHUB_URL!
  goto :failed
)

call :confirm "是否读取 GitHub main 的当前状态？"
if errorlevel 1 goto :cancelled

rem GitHub 只作为部署接收端，不与工蜂 dev 合并；先读取 main 的当前提交，
rem 再用 force-with-lease 覆盖，确保覆盖前 GitHub 没有被其他人悄悄改动。
git ls-remote --exit-code --heads github main >nul 2>nul
set "GITHUB_MAIN_LOOKUP_EXIT=!ERRORLEVEL!"
if "!GITHUB_MAIN_LOOKUP_EXIT!"=="2" (
  set "GITHUB_MAIN_SHA="
  echo GitHub main 尚不存在，将创建这个分支。
) else if not "!GITHUB_MAIN_LOOKUP_EXIT!"=="0" (
  echo 读取 GitHub main 失败，未执行 GitHub 推送。
  goto :failed
) else (
  git fetch --no-tags github main
  if errorlevel 1 (
    echo 读取 GitHub main 失败，未执行 GitHub 推送。
    goto :failed
  )
  for /f "delims=" %%A in ('git rev-parse refs/remotes/github/main 2^>nul') do set "GITHUB_MAIN_SHA=%%A"
  if not defined GITHUB_MAIN_SHA (
    echo 无法确定 GitHub main 的当前提交，未执行 GitHub 推送。
    goto :failed
  )
  echo GitHub main 当前提交：!GITHUB_MAIN_SHA!
)

echo 工蜂 dev 当前提交：
git rev-parse dev
if defined GITHUB_MAIN_SHA (
  echo.
  echo 这次同步会用工蜂 dev 的完整内容覆盖 GitHub main。
  echo GitHub main 原提交只用于覆盖前的安全校验，不会合并回工蜂。
  call :confirm "是否确认覆盖 GitHub main？GitHub main 的旧提交将不再作为部署内容。"
  if errorlevel 1 goto :cancelled
  git push --force-with-lease=refs/heads/main:!GITHUB_MAIN_SHA! github dev:main
) else (
  call :confirm "是否确认创建 GitHub main 并推送当前 dev？"
  if errorlevel 1 goto :cancelled
  git push github dev:main
)
if errorlevel 1 (
  echo 推送到 GitHub 失败。若提示远程分支已变化，请重新运行脚本读取最新状态；若提示分支受保护，请在 GitHub 仓库设置中允许维护者更新 main。
  goto :failed
)

echo.
echo 同步完成：工蜂 dev 和 GitHub main 已更新。
echo EdgeOne 会在 GitHub main 更新后自动构建；部署完成后再打开预览地址。
goto :done

:confirm
choice /c YN /n /m "%~1 [Y/N] "
if errorlevel 2 exit /b 1
exit /b 0

:cancelled
echo 已取消，后续远程操作未执行；工蜂 dev 未被 GitHub 历史反向修改。
goto :done

:failed
echo 同步未完成。
set "EXIT_CODE=1"
goto :finish

:done
set "EXIT_CODE=0"

:finish
echo.
pause
exit /b %EXIT_CODE%
