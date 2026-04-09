locals {
  src = [
    "file://atlas/schemas",
    "file://atlas/tables",
  ]
  migration_dir = "file://migrations"
}

env "local" {
  src = local.src
  dev = "docker://postgres/${getenv("POSTGRES_VERSION")}/dev?search_path=${getenv("DB_SCHEMA")}"
  url = "postgres://${getenv("POSTGRES_USER")}:${getenv("POSTGRES_PASSWORD")}@db:5432/${getenv("POSTGRES_DB")}"
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
