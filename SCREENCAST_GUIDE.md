# Инструкция по добавлению скринкаста

## Где находится секция для видео

В файле `public/index.html` найдите секцию с ID `demo-video`:

```html
<!-- Video Demo Section - Скринкаст -->
<section id="demo-video" class="demo-video-section">
    ...
    <div class="demo-video-container">
        <!-- Здесь будет скринкаст работы сервиса -->
        <div class="video-placeholder">
            ...
        </div>
        <!-- <video controls poster="demo-poster.jpg">
            <source src="demo-screencast.mp4" type="video/mp4">
        </video> -->
    </div>
</section>
```

## Как записать скринкаст

### Рекомендации по содержанию:
1. **Длительность**: 60-90 секунд
2. **Разрешение**: 1920x1080 или 1280x720
3. **Формат**: MP4 (H.264)

### Сценарий записи:
1. **0-10 сек**: Открываем интерфейс SmartLab
2. **10-20 сек**: Загружаем аудиофайл звонка
3. **20-30 сек**: Система обрабатывает (можно ускорить)
4. **30-50 сек**: Показываем готовый отчёт с:
   - Оценкой звонка
   - Найденными ошибками
   - Рекомендациями
5. **50-60 сек**: Скроллим вниз, показываем детали
6. **60-75 сек**: Показываем график эмоций/динамику
7. **75-90 сек**: Копируем готовую рекомендацию

### Инструменты для записи:
- **Windows**: OBS Studio, Camtasia
- **Mac**: QuickTime, ScreenFlow, OBS Studio
- **Linux**: SimpleScreenRecorder, OBS Studio

## Как добавить видео на сайт

### Шаг 1: Сохраните видео
Сохраните записанный файл как `demo-screencast.mp4` в папку `public/`

### Шаг 2: Создайте постер (превью)
Сделайте скриншот интересного момента из видео и сохраните как `demo-poster.jpg` в папку `public/`

### Шаг 3: Замените placeholder в HTML

Найдите в `public/index.html`:
```html
<div class="video-placeholder">
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="40" fill="#1565d8" opacity="0.1"/>
        <path d="M32 25L55 40L32 55V25Z" fill="#1565d8"/>
    </svg>
    <p>Видео-демонстрация сервиса</p>
    <small>Скринкаст будет добавлен</small>
</div>
<!-- <video controls poster="demo-poster.jpg">
    <source src="demo-screencast.mp4" type="video/mp4">
</video> -->
```

Замените на:
```html
<video controls poster="demo-poster.jpg">
    <source src="demo-screencast.mp4" type="video/mp4">
    Ваш браузер не поддерживает видео.
</video>
```

### Шаг 4: Перезапустите сервер
```bash
npm run dev
```

## Оптимизация видео

Если файл получился слишком большим (> 10 МБ), сожмите его с помощью FFmpeg:

```bash
ffmpeg -i demo-screencast.mp4 -c:v libx264 -crf 28 -preset medium -c:a aac -b:a 128k demo-screencast-compressed.mp4
```

Параметры:
- `-crf 28`: качество (18-28, чем меньше - тем лучше)
- `-preset medium`: скорость сжатия
- `-b:a 128k`: битрейт аудио

## Альтернатива: YouTube/Vimeo

Если не хотите хостить видео на сервере:

1. Загрузите видео на YouTube/Vimeo
2. Получите embed-код
3. Замените `<video>` на iframe:

```html
<iframe width="100%" height="600" 
    src="https://www.youtube.com/embed/ВАШ_ID" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen>
</iframe>
```

Добавьте стили для iframe:
```css
.demo-video-container iframe {
    border-radius: 15px;
}
```

## Checklist

- [ ] Видео записано (60-90 сек)
- [ ] Видео сжато (< 10 МБ)
- [ ] Создан постер (demo-poster.jpg)
- [ ] Файлы скопированы в `public/`
- [ ] HTML обновлён
- [ ] Сервер перезапущен
- [ ] Проверено на мобильных устройствах

## Примеры хороших скринкастов

Посмотрите для вдохновения:
- https://www.loom.com (как они показывают свой продукт)
- https://www.notion.so (демо страницы продуктов)
- https://linear.app (анимация интерфейсов)

**Главное правило**: Показывайте конкретную пользу, а не просто интерфейс!


