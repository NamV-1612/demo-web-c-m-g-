$member1 = @(
  "src/pages/Customer/Login",
  "src/pages/Customer/Profile",
  "src/pages/Admin/UserManagement",
  "src/services/auth.ts",
  "src/services/api.ts",
  "backend/src/models/userModel.ts",
  "backend/src/controllers/authController.ts",
  "backend/src/routes/authRoute.ts",
  "backend/src/routes/userRoute.ts"
)

$member2 = @(
  "src/pages/Customer/Landing",
  "src/pages/Customer/Home",
  "src/pages/Admin/MenuManagement",
  "src/pages/Admin/PromoManagement",
  "src/models/usePromoModel.ts",
  "backend/src/models/productModel.ts",
  "backend/src/models/categoryModel.ts",
  "backend/src/models/promoModel.ts",
  "backend/src/controllers/productController.ts",
  "backend/src/controllers/promoController.ts",
  "backend/src/routes/productRoute.ts",
  "backend/src/routes/promoRoute.ts"
)

$member3 = @(
  "src/pages/Customer/Cart",
  "src/pages/Customer/Pay",
  "src/pages/Customer/PayQR",
  "src/models/useCartModel.ts",
  "src/models/useOrderModel.ts",
  "src/utils/rules.js",
  "backend/src/controllers/paymentController.ts",
  "backend/src/routes/paymentRoute.ts"
)

$member4 = @(
  "src/pages/Customer/History",
  "src/pages/Admin/OrderManagement",
  "src/pages/Admin/Dashboard",
  "src/pages/Staff/Dashboard",
  "src/pages/Staff/Login",
  "backend/src/models/orderModel.ts",
  "backend/src/controllers/orderController.ts",
  "backend/src/routes/orderRoute.ts"
)

function Copy-KeepStructure {
    param([string]$Source, [string]$DestinationDir)
    if (Test-Path $Source) {
        $DestPath = Join-Path $DestinationDir $Source
        $DestParent = Split-Path $DestPath -Parent
        if (!(Test-Path $DestParent)) {
            New-Item -ItemType Directory -Force -Path $DestParent | Out-Null
        }
        if ((Get-Item $Source).PSIsContainer) {
            Copy-Item -Path $Source -Destination $DestParent -Recurse -Force
        } else {
            Copy-Item -Path $Source -Destination $DestPath -Force
        }
        Write-Host "Copied $Source"
    } else {
        Write-Host "Warning: $Source not found, skipping."
    }
}

Write-Host "Copying Member 1..."
foreach ($item in $member1) { Copy-KeepStructure $item "KhauPhan_ThanhVien1" }

Write-Host "Copying Member 2..."
foreach ($item in $member2) { Copy-KeepStructure $item "KhauPhan_ThanhVien2" }

Write-Host "Copying Member 3..."
foreach ($item in $member3) { Copy-KeepStructure $item "KhauPhan_ThanhVien3" }

Write-Host "Copying Member 4..."
foreach ($item in $member4) { Copy-KeepStructure $item "KhauPhan_ThanhVien4" }
