/**
 * Types for rich message content (embeds, buttons, etc.)
 */

/**
 * Represents a rich embed that can be sent with messages
 */
export interface Embed {
  /** Embed title */
  title?: string;
  
  /** Main embed description/content */
  description?: string;
  
  /** URL that the title links to */
  url?: string;
  
  /** Color of the embed sidebar (hex string or number) */
  color?: string | number;
  
  /** Array of fields to display */
  fields?: EmbedField[];
  
  /** Footer information */
  footer?: EmbedFooter;
  
  /** Large image to display */
  image?: EmbedImage;
  
  /** Small thumbnail image */
  thumbnail?: EmbedImage;
  
  /** Author information */
  author?: EmbedAuthor;
  
  /** Timestamp to display */
  timestamp?: Date;
}

/**
 * A field in an embed
 */
export interface EmbedField {
  /** Field name/title */
  name: string;
  
  /** Field value/content */
  value: string;
  
  /** Whether this field should be displayed inline */
  inline?: boolean;
}

/**
 * Footer of an embed
 */
export interface EmbedFooter {
  /** Footer text */
  text: string;
  
  /** Small icon URL for the footer */
  iconUrl?: string;
}

/**
 * Image in an embed
 */
export interface EmbedImage {
  /** URL to the image */
  url: string;
  
  /** Image width (optional, usually auto-detected) */
  width?: number;
  
  /** Image height (optional, usually auto-detected) */
  height?: number;
}

/**
 * Author information for an embed
 */
export interface EmbedAuthor {
  /** Author name */
  name: string;
  
  /** Small icon URL for the author */
  iconUrl?: string;
  
  /** URL that the author name links to */
  url?: string;
}

/**
 * Options for sending a message
 */
export interface MessageOptions {
  /** Plain text content */
  content?: string;
  
  /** Array of embeds to include */
  embeds?: Embed[];
  
  /** Array of files to attach */
  files?: FileAttachment[];
  
  /** Whether to use text-to-speech */
  tts?: boolean;
  
  /** Message components (action rows containing buttons, select menus, etc.) */
  components?: ActionRow[];
  
  /** Whether this message should only be visible to the user (ephemeral) */
  ephemeral?: boolean;
  
  /** Message to reply to */
  replyTo?: string;
}

/**
 * File attachment for messages
 */
export interface FileAttachment {
  /** File name */
  name: string;
  
  /** File data (Buffer or path) */
  data: Buffer | string;
  
  /** Description/alt text for the file */
  description?: string;
}

/**
 * Base interface for message components
 */
export interface MessageComponent {
  /** Type of component */
  type: ComponentType | string;
}

/**
 * Types of message components
 */
export enum ComponentType {
  /** Action row container */
  ActionRow = 1,
  
  /** Button component */
  Button = 2,
  
  /** Select menu */
  SelectMenu = 3,
  
  /** Text input (for modals) */
  TextInput = 4
}

/**
 * String literal type for component types (for easier use)
 */
export type ComponentTypeString = 'action-row' | 'button' | 'select' | 'text-input';

/**
 * Button component
 */
export interface Button extends MessageComponent {
  type: 'button' | ComponentType.Button;
  
  /** Button style/color */
  style: ButtonStyleString | ButtonStyle;
  
  /** Text label on the button */
  label?: string;
  
  /** Emoji to display */
  emoji?: string;
  
  /** Custom identifier for this button */
  customId?: string;
  
  /** URL for link buttons */
  url?: string;
  
  /** Whether the button is disabled */
  disabled?: boolean;
}

/**
 * Button styles
 */
export enum ButtonStyle {
  /** Blurple button */
  Primary = 1,
  
  /** Gray button */
  Secondary = 2,
  
  /** Green button */
  Success = 3,
  
  /** Red button */
  Danger = 4,
  
  /** Link button (gray with external link) */
  Link = 5
}

/**
 * String literal type for button styles (for easier use)
 */
export type ButtonStyleString = 'primary' | 'secondary' | 'success' | 'danger' | 'link';

/**
 * Select menu component
 */
export interface SelectMenu extends MessageComponent {
  type: 'select' | ComponentType.SelectMenu;
  
  /** Custom identifier for this select menu */
  customId: string;
  
  /** Array of options */
  options: SelectMenuOption[];
  
  /** Placeholder text when nothing is selected */
  placeholder?: string;
  
  /** Minimum number of selections required */
  minValues?: number;
  
  /** Maximum number of selections allowed */
  maxValues?: number;
  
  /** Whether the menu is disabled */
  disabled?: boolean;
}

/**
 * Option in a select menu
 */
export interface SelectMenuOption {
  /** User-facing option label */
  label: string;
  
  /** Developer-defined value */
  value: string;
  
  /** Description of the option */
  description?: string;
  
  /** Emoji to display */
  emoji?: string;
  
  /** Whether this option is selected by default */
  default?: boolean;
}

/**
 * Action row container for components
 */
export interface ActionRow extends MessageComponent {
  type: 'action-row' | ComponentType.ActionRow;
  
  /** Components in this row */
  components: (Button | SelectMenu)[];
}
