# Stepik Extensions

## Для разработчиков расширений

Рассмаривайте расширение как самостоятельный статический веб-сайт.

1. Создайте директорию `dir_name` - это будет корневая директория расширения.<br>
В качестве `dir_name` рекомендуем использовать идентификатор расширения, 
но это не обязательно.
2. В корневой директории создайте файлы:<br>
**Обязательные должны присутсвовать:**
- `extension.json` - файл описания расширения (формат файла см. ниже).
- `index.html` - это точка входа для вашего расширения.<br>
- `path/to/logo/ext_logo` - логотип вашего расширения.<br>
**Опционально:**
- Другие необходимые вам сценарии JavaScript, CSS и другие файлы, 
с любой структурой директорий и файлов.<br>
**Примечание:** Но не создавайте директорию `imports` 
в корне расширения. Содержимое этой директории будет недоступно для вашего расширения.
Это специальная директория для импорта глобальных библиотек и ресурсов в ваше расширение.
Можете создавать эту директорию во время отладки вашего расширения, разместив в ней
необходимые библиотеки, например, jQuery, Bootstrap и т.д. Но не не помещайте
эту директории в пакет расширений.

3. Упакуйте расширение в пакет (zip-архив).
4. Загрузите его на `ext.stepik.org`

Для примеров смотрите расширения в директории `packages`

### extension.json (текущая версия формата файла 0.1)
```json
{
  "id": "com.example.extension",
  "name": "Name your extension",
  "description": "Description for your extension",
  "logo": "path/to/logo",
  "allow_anonymous_user": true,
  "version": "1.0",
  "package_version": "1.0"
}
```
**`id`** - придумайте уникальный идентификатор расширения, например, для расширений
созданных в Stepik используются: `org.stepik.extensions.extension_id`. 
Идентификатор расширения может содержать только цифры, латинские буквы, знак подчеркивания,
а также точку в качестве разделителя групп символов, но нельзя чтобы точка была в начале или в конце,
а также запрещено несколько точек подряд. Не более 64 символов.

**`name`** - имя вашего расширения (Не более 32 символов).<br>
**`description`** - описание вашего расширения, для чего оно предназначено (Не более 1024 символов).<br>
**`logo`** - путь к логотипу расширения (относительно корня расширения). Например, `img/logo.png`.<br>
**`allow_anonymous_user`** - если `false`, то для запуска расширения необходима аутентификация пользователя на Stepik.<br>
**`version`** - версия расширения. Не более 15 символов.<br>
**`package_version`** - версия формата файла `extension.json`.<br>

Все поля обязательные.

### Глобальные библиотеки

Во время работы расширения, есму доступны следующие библиотеки:
- **imports/requirejs/require.js** 2.3.3
- **imports/jquery/jquery.min.js** 3.2.1
- **imports/bootstrap/dist/js/bootstrap.min.js** 3.3.7
- **imports/bootstrap/dist/css/bootstrap.min.css**
- **imports/bootstrap/dist/css/bootstrap-theme.min.css**
- **imports/bootstrap-fileinput/dist/js/fileinput.min.js**
- **imports/bootstrap-fileinput/dist/css/fileinput.min.css**
- **imports/bootstrap-select/dist/js/bootstrap-select.min.js**
- **imports/bootstrap-select/dist/css/bootstrap-select.min.css**
- **imports/Flot/jquery.flot.js**
- **imports/Flot/jquery.flot.errorbars.js**
- **imports/Flot/jquery.flot.time.js**
- **imports/js/stepik-api.js**

Все пути относительно корня расширения. Импортируйте нужные вам глобальные библиотеки и расширения
будто бы они расположены в корне вашего расширения `imports/...`.

### Пакеты расширений

Пакет - это одно или несколько расширений, упакованных в zip-архив.

Для одного раширения в пакете:
```
package.zip<br>
|_ extension.json<br>
|_ index.html<br>
|_ logo.png
|_ ...
```

или

```
package.zip
|_ ext_dir
   |_ extension.json
   |_ index.html
   |_ logo.png
   |_ ...
```

Для нескольких расширений в пакете:

```
package.zip
|_ ext_1_dir
|  |_ extension.json
|  |_ index.html
|  |_ logo.png
|  |_ ...
|
|_ ext_2_dir
   |_ extension.json
   |_ index.html
   |_ logo.png
   |_ ...
```

### Отладка расширения

1. Если вы используете глобальные библиотеки, то на время отладки создайте
директорию `imports` и поместите туда, необходимые библиотеки и ресурсы
(например для jQuery, *imports/jquery/js/jquery.min.js*).
2. Откройте файл *index.html* в браузере.

### Отладка расширений, которым необходима авторизации на Stepik

 -- раздел в разработке --

### Другие особенности

- Всплывающие окна блокируются
- Будут открываться только ссылки с `target=_self`, 
всё остальное заблокировано.

## Для разработчиков ext.stepik.org

**Backend**

Django 1.10.6

**Frontend**

ES6

### Install server
```
mkvirtualenv -p `which python3` extensions
make init
```

### Run server

Первый запуск:
```
workon extensions
make init
python manage.py migrate
make frontend
make prepare_run
python manage.py runserver
```
Следующие запуски:
```
workon extensions
make prepare_run
python manage.py runserver
```

### Упаковка расширений

`
make zip-packages
`

### Перевод файлов проекта из ES6
`
make translate-apps-js
`

### Подготовка проекта к деплою

`make prepare_production`

### Запуск тестов
```
py.test apps/<app_name>/tests.py
```
