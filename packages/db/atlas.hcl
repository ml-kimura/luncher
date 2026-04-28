locals {
  src = [
    "file://atlas/schemas",
    "file://atlas/tables",
  ]
  migration_dir = "file://migrations"
}

env "local" {
  src   = local.src
  dev   = "postgres://${getenv("POSTGRES_USER")}:${getenv("POSTGRES_PASSWORD")}@db:5432/${getenv("ATLAS_DEV_DB")}?search_path=${getenv("DB_SCHEMA")}&sslmode=disable"
  url   = "postgres://${getenv("POSTGRES_USER")}:${getenv("POSTGRES_PASSWORD")}@db:5432/${getenv("POSTGRES_DB")}?search_path=${getenv("DB_SCHEMA")}&sslmode=disable"
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
