#!/bin/bash

# Prompt the user for a migration name
read -p "Enter the migration name: " migration_name

# Check if the migration name is empty
if [ -z "$migration_name" ]; then
  echo "Migration name cannot be empty. Exiting."
  exit 1
fi

# Run the dotnet ef migrations add command
dotnet ef migrations add "$migration_name" -o ../Ordering.Infrastructure/Data/Migrations -p ../../Ordering.Infrastructure.csproj -s ../../../Ordering.API/Ordering.API.csproj

# Check if the command was successful
if [ $? -eq 0 ]; then
  echo "Migration '$migration_name' added successfully."
else
  echo "Failed to add migration '$migration_name'."
fi