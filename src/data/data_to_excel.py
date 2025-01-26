import os
import json
import pandas as pd
import firebase_admin
from firebase_admin import db
from firebase_admin import credentials
from pathlib import Path
from dotenv import load_dotenv

users = []
excel_path = 'src/data/wedding.xlsx'

resume_columns = {
  'Invitados totales': ['attendAnswer', 'companionChoise'],
  'Casa rural': ['willComeToCountryHouse'],
  'Colchones': ['mattressQuantity'],
  'Interesados en el transporte': ['transportChoise']
}

counter = {
  'attendAnswer': 0,
  'companionChoise': 0,
  'willComeToCountryHouse': 0,
  'mattressQuantity': 0,
  'transportChoise': 0,
  'size': {
    'XS': 0,
    'S': 0,
    'M': 0,
    'L': 0,
    'XL': 0,
    'XXL': 0
  },
  'sizeCompanion': {
    'XS': 0,
    'S': 0,
    'M': 0,
    'L': 0,
    'XL': 0,
    'XXL': 0
  }
}


def start_db_connection():
  database_url = os.getenv('DATABASE_URL_PRO')
  private_key_route = Path(__file__).parent / 'private-key.json'

  cred = credentials.Certificate(private_key_route)
  firebase_admin.initialize_app(cred, {
      'databaseURL': database_url
  })


def prepare_users():
  db_info = db.reference('users').get()

  for user in db_info:
    users.append(db_info[user])


def prepare_columns():
  columns = []
  column_keys = []

  json_data = Path('src/data/wedding-form.json').read_text()
  data = json.loads(json_data)

  for blockKey in data['form']:
    block = data['form'][blockKey]

    if 'fields' in block:
      fields = block['fields']

      for columnKey in fields:
        if 'columnName' in fields[columnKey]:
          columns.append(fields[columnKey]['columnName'])
          column_keys.append(columnKey)

  return {
    'columns': columns,
    'column_keys': column_keys
  }


def prepare_resume_columns():
  columns = []

  for column_key in resume_columns:
    columns.append(column_key)

  return columns


def prepare_value(key, value):
  new_value = value

  if type(value) == bool and value is True:
    if key in counter:
      counter[key] += 1
    new_value = 'Sí'
  elif type(value) == bool and value is False:
    new_value = 'No'
  elif type(value) == str and key in counter:
    counter[key][value] += 1
  elif type(value) == int:
    counter[key] = int(counter[key]) + value

  return new_value


def prepare_rows(column_keys):
  rows = []

  for user in users:
    row = []

    for column in column_keys:
      if column in user:
        row.append(prepare_value(column, user[column]))
      else:
        row.append('')

    rows.append(row)
  
  return rows


def prepare_resume_rows():
  rows = []

  for column in resume_columns:
    value = 0
    deep_row = {}

    for key in resume_columns[column]:
      if type(counter[key]) == int:
        value += counter[key]
      else:
        for size in counter[key]:
          if size not in deep_row:
            deep_row[size] = counter[key][size]
          else:
            deep_row[size] += counter[key][size]

        value = deep_row
    
    rows.append(value)

  return rows


def collect_main_dataframe():
  columns = prepare_columns()
  rows = prepare_rows(columns['column_keys'])

  df = pd.DataFrame(rows, columns=columns['columns'])
  return df


def collect_resume_dataframe():
  columns = prepare_resume_columns()
  rows = prepare_resume_rows()

  df = pd.DataFrame([rows], columns=columns)
  return df


def create_excel():
  main_df = collect_main_dataframe()
  resume_df = collect_resume_dataframe()

  writer = pd.ExcelWriter(excel_path, engine = 'xlsxwriter')

  main_df.to_excel(writer, sheet_name='Datos generales')
  resume_df.to_excel(writer, sheet_name='Resumen de los datos')

  writer.close()



load_dotenv()
print('Datos del fichero env cargados...')
start_db_connection()
print('Conexión con la base de datos iniciada...')
prepare_users()
print('Datos de los usuarios recopilados y preparados...')
create_excel()
print('Excel creado con éxito.')