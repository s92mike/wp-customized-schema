module.exports = function (grunt) {
  grunt.initConfig({
    compress: {
      main: {
        options: {
          archive: 'bl-author-authority-section.zip'
        },
        files: [
          { src: ['bl-author-authority-section.php'], dest: '/', filter: 'isFile' }, // includes files in path
          { src: ['php/**'], dest: '/' }, // includes files in path and its subdirs,
          { src: ['dist/**'], dest: '/' }, // includes files in path and its subdirs
		  { src: ['build/**'], dest: '/' }, // includes files in path and its subdirs
          { src: ['lib/**'], dest: '/' },
		  { src: ['js/**'], dest: '/' }
        ]
      }
    }
  })
  grunt.registerTask('default', ['compress'])

  grunt.loadNpmTasks('grunt-contrib-compress')
}
