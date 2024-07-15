module Jekyll
    class TermTag < Liquid::Tag
      def initialize(tag_name, text, tokens)
        super
        @text = text.strip
      end
  
      def render(context)
        "<span class='glossary-term' data-term='#{@text}'>#{@text}</span>"
      end
    end
  end
  
  Liquid::Template.register_tag('term', Jekyll::TermTag)