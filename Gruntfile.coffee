module.exports = (grunt) ->

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks)

  readrConfig =
    src: 'src'
    dist: 'dist'

  grunt.initConfig(

    pkg: grunt.file.readJSON('package.json')
    readr: readrConfig

    watch:
      dist:
        files: [ '<%= readr.src %>/**/*' ]
        tasks: [ 'build' ]

    clean:
      start: [ '<%= readr.dist %>' ]
      end: [ '<%= readr.dist %>/*', '!<%= readr.dist %>/theme.html' ]

    jshint:
      options:
        jshintrc: '<%= readr.src %>/js/.jshintrc'
      beforeconcat: '<%= readr.src %>/js/{,*/}.js'
      afterconcat: '<%= readr.dist %>/js/main.js'

    concat:
      options:
        separator: ';'
      dist:
        files:
          '<%= readr.dist %>/js/main.js': '<%= readr.src %>/js/{,*/}*.js'

    uglify:
      dist:
        files:
          '<%= readr.dist %>/js/main.js': '<%= readr.dist %>/js/main.js'

    compass:
      options:
        sassDir: '<%= readr.src %>/scss'
        cssDir: '<%= readr.dist %>/css'
        javascriptsDir: '<%= readr.src %>/js'
        fontsDir: '<%= readr.src %>/scss/fonts'
        imagesDir: '<%= readr.src %>/img'
        outputStyle: 'compressed'
        relativeAssets: true
      dist: {}

    replace:
      dist:
        options:
          variables:
            'script': '<%= grunt.file.read(readr.dist + "/js/main.js") %>'
            'stylesheet': '<%= grunt.file.read(readr.dist + "/css/style.css") %>'
        files: [
          expand: true,
          flatten: true,
          src: '<%= readr.src %>/theme.html',
          dest: '<%= readr.dist %>'
        ]

    shell:
      copy:
        command: 'cat <%= readr.dist %>/theme.html | pbcopy'

    notify:
      dist:
        options:
          title: "Build complete!"
          message: "Theme built and copied to clipboard."

    concurrent:
      dist: [ 'uglify', 'compass:dist' ]
      end: [ 'clean:end', 'shell:copy' ]
  )

  grunt.registerTask('build', [
    'clean:start',
    'jshint:beforeconcat',
    'concat',
    'jshint:afterconcat',
    'concurrent:dist',
    'replace',
    'concurrent:end'
    'notify'
  ])

  grunt.registerTask('default', [
    'build'
  ])