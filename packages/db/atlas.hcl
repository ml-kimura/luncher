locals {
  src = [
    "file://atlas/schemas",
    "file://atlas/tables",
  ]
  migration_dir = "file://migrations"
}

env "local" {
  src   = local.src
  dev   = getenv("ATLAS_DEV_URL")
  url   = getenv("DATABASE_URL")
  migration {
    dir = local.migration_dir
  }
}

env "cloud" {
  src = local.src
  url = getenv("DATABASE_URL")
  migration {
    dir = local.migration_dir
  }
}
