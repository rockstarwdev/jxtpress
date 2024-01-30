import Paragraph            from "../native-blocks/Paragraph"
import Layout               from "../native-blocks/Layout"
import InspectorClasses     from "../native-blocks/InspectorClasses"
import InspectorCSS         from "../native-blocks/InspectorCSS"
import InspectorID          from "../native-blocks/InspectorID"
import Container            from "../native-blocks/Container"
import SiteTitle            from "../native-blocks/SiteTitle"
import PostTitle            from "../native-blocks/PostTitle"
import PostContent          from "../native-blocks/PostContent"
import PostAttr             from "../native-blocks/PostAttr"
import PostTags             from "../native-blocks/PostTags"
import PostComments         from "../native-blocks/PostComments"
import Image                from "../native-blocks/Image"
import Video                from "../native-blocks/Video.mjs"
import PostFeatureImage     from "../native-blocks/PostFeatureImage"
import Title                from "../native-blocks/Title"
import Conditional          from "../native-blocks/Conditional" 
import Lists                from "../native-blocks/Lists.mjs"
import ListItem             from "../native-blocks/ListItem.mjs"
import AccordionItem        from "../native-blocks/AccordionItem.mjs"
import InspectorScript      from "../native-blocks/InspectorScript.mjs"
import Media                from "../native-blocks/Media.mjs"
import RawHTML              from "../native-blocks/RawHTML.mjs"
import PostLoop             from "../native-blocks/PostLoop.mjs"
import PostEmbed            from "../native-blocks/PostEmbed.mjs"
import PostPrice            from "../native-blocks/PostPrice.mjs"
import Element              from "../native-blocks/Element.mjs"
import InspectorFonts       from "../native-blocks/InspectorFonts.mjs"
import Card                 from "../native-blocks/Card.mjs"
import CodeHighlighter      from "../native-blocks/CodeHighlighter.mjs"
import Form                 from "../native-blocks/Form.mjs"
import FormField            from "../native-blocks/FormField.mjs"
import HeaderNav            from "../native-blocks/HeaderNav.mjs"        
import MenuItem             from "../native-blocks/MenuItem.mjs"
import PostPagination       from "../native-blocks/PostPagination.mjs"
import PostImages           from "../native-blocks/PostImages.mjs"
import PostActionButton     from "../native-blocks/PostActionButton.mjs"
import PostQuantity         from "../native-blocks/PostQuantity.mjs"
import PostVariations       from "../native-blocks/PostVariations.mjs"
import PostCart             from "../native-blocks/PostCart.mjs"
import InspectorAttributes  from "../native-blocks/InspectorAttributes.mjs"
import PostBinding from "../native-blocks/PostBinding.mjs"

export default async  (db, core) => {
 
    console.log ("Register blocks", )
    
    core.register_block(Paragraph, {} )
    core.register_block(Title, {} )
    core.register_block(Element)
    core.register_block(Layout, {} )
    core.register_block(Conditional,{})
    core.register_block(InspectorClasses,{})
    core.register_block(InspectorCSS,{})
    core.register_block(InspectorID,{})
    core.register_block(InspectorFonts,{})
    core.register_block(InspectorAttributes,{})
    core.register_block(Image,{})
    core.register_block(Video,{})
    core.register_block(Card,{})
    core.register_block(CodeHighlighter, {})
    core.register_block(HeaderNav)
    core.register_block(MenuItem)
    core.register_block(Container,{})
    core.register_block(SiteTitle,{})
    core.register_block(PostTitle,{})
    core.register_block(PostAttr,{})
    core.register_block(PostContent,{})
    core.register_block(PostTags,{})
    core.register_block(PostLoop,{})
    core.register_block(PostEmbed,{})
    core.register_block(PostComments,{})
    core.register_block(PostFeatureImage) 
    core.register_block(PostPagination) 
    core.register_block(PostPrice, {})
    core.register_block(PostImages, {})
    core.register_block(PostQuantity, {})
    core.register_block(PostActionButton,{})
    core.register_block(PostVariations,{} )
    core.register_block(PostBinding,{})
    core.register_block(PostCart,{} )
    core.register_block(Lists, {})
    core.register_block(ListItem, {})
    core.register_block(AccordionItem, {})
    core.register_block(InspectorScript,{})
    core.register_block(Media,{})
    core.register_block(RawHTML,{})
    core.register_block(Form,{})
    core.register_block(FormField,{})
}
