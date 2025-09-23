import { Share, Alert, Linking, Platform } from 'react-native';
import { ShareableContent, ScanHistory, SafeFood } from '../types';

export class SharingService {
  static async shareScanResult(scanHistory: ScanHistory) {
    const shareContent: ShareableContent = {
      type: 'scan_result',
      title: `GutSafe Scan: ${scanHistory.foodItem.name}`,
      description: this.generateScanDescription(scanHistory),
      data: scanHistory,
      shareUrl: `gutsafe://scan/${scanHistory.id}`,
    };

    return this.shareContent(shareContent);
  }

  static async shareSafeFood(safeFood: SafeFood) {
    const shareContent: ShareableContent = {
      type: 'safe_food',
      title: `My Safe Food: ${safeFood.foodItem.name}`,
      description: this.generateSafeFoodDescription(safeFood),
      data: safeFood,
      shareUrl: `gutsafe://safe-food/${safeFood.id}`,
    };

    return this.shareContent(shareContent);
  }

  static async shareGutHealthReport(reportData: any) {
    const shareContent: ShareableContent = {
      type: 'gut_report',
      title: 'My Gut Health Report',
      description: 'Check out my gut health insights from GutSafe!',
      data: reportData,
      shareUrl: 'gutsafe://report',
    };

    return this.shareContent(shareContent);
  }

  static async shareToSocialMedia(content: ShareableContent, platform: 'instagram' | 'twitter' | 'facebook') {
    const shareText = this.generateSocialMediaText(content);
    
    switch (platform) {
      case 'instagram':
        return this.shareToInstagram(shareText, content);
      case 'twitter':
        return this.shareToTwitter(shareText, content);
      case 'facebook':
        return this.shareToFacebook(shareText, content);
      default:
        throw new Error('Unsupported social media platform');
    }
  }

  private static async shareContent(content: ShareableContent) {
    try {
      const shareOptions = {
        message: `${content.title}\n\n${content.description}\n\n${content.shareUrl}`,
        url: content.shareUrl,
        title: content.title,
      };

      const result = await Share.share(shareOptions);
      
      if (result.action === Share.sharedAction) {
        console.log('Content shared successfully');
        return { success: true, action: result.action };
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
        return { success: false, action: result.action };
      }
    } catch (error) {
      console.error('Error sharing content:', error);
      Alert.alert('Error', 'Failed to share content. Please try again.');
      return { success: false, error };
    }
  }

  private static generateScanDescription(scanHistory: ScanHistory): string {
    const { foodItem, analysis } = scanHistory;
    const resultEmoji = this.getResultEmoji(analysis.result);
    const confidence = Math.round(analysis.confidence * 100);
    
    let description = `${resultEmoji} ${analysis.result.toUpperCase()}\n`;
    description += `Confidence: ${confidence}%\n`;
    description += `Source: ${analysis.dataSource}\n\n`;
    
    if (analysis.flaggedIngredients.length > 0) {
      description += `⚠️ Flagged ingredients:\n`;
      analysis.flaggedIngredients.forEach(ingredient => {
        description += `• ${ingredient.ingredient} (${ingredient.severity})\n`;
      });
      description += '\n';
    }
    
    if (analysis.safeAlternatives.length > 0) {
      description += `✅ Safe alternatives:\n`;
      analysis.safeAlternatives.slice(0, 3).forEach(alternative => {
        description += `• ${alternative}\n`;
      });
    }
    
    return description;
  }

  private static generateSafeFoodDescription(safeFood: SafeFood): string {
    const { foodItem } = safeFood;
    let description = `✅ Safe for my gut health!\n\n`;
    description += `Used ${safeFood.usageCount} times\n`;
    description += `Last used: ${this.formatDate(safeFood.lastUsed)}\n`;
    description += `Source: ${foodItem.dataSource}\n\n`;
    
    if (foodItem.fodmapLevel) {
      description += `FODMAP Level: ${foodItem.fodmapLevel}\n`;
    }
    if (foodItem.histamineLevel) {
      description += `Histamine Level: ${foodItem.histamineLevel}\n`;
    }
    if (foodItem.glutenFree) {
      description += `Gluten Free: Yes\n`;
    }
    if (foodItem.lactoseFree) {
      description += `Lactose Free: Yes\n`;
    }
    
    if (safeFood.notes) {
      description += `\nNotes: ${safeFood.notes}`;
    }
    
    return description;
  }

  private static generateSocialMediaText(content: ShareableContent): string {
    const hashtags = '#GutSafe #GutHealth #FoodSafety #HealthyEating';
    
    switch (content.type) {
      case 'scan_result':
        return `Just scanned ${content.data.foodItem.name} with GutSafe! ${content.description}\n\n${hashtags}`;
      case 'safe_food':
        return `Added ${content.data.foodItem.name} to my safe foods! ${content.description}\n\n${hashtags}`;
      case 'gut_report':
        return `Check out my gut health insights! ${content.description}\n\n${hashtags}`;
      default:
        return `${content.title}\n\n${content.description}\n\n${hashtags}`;
    }
  }

  private static async shareToInstagram(text: string, content: ShareableContent) {
    // Instagram doesn't support direct text sharing, so we'll use the general share
    // In a real app, you might want to use Instagram's API or Stories API
    const shareOptions = {
      message: text,
      url: content.shareUrl,
    };
    
    try {
      await Share.share(shareOptions);
    } catch (error) {
      console.error('Error sharing to Instagram:', error);
      Alert.alert('Error', 'Failed to share to Instagram. Please try again.');
    }
  }

  private static async shareToTwitter(text: string, content: ShareableContent) {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    
    try {
      const supported = await Linking.canOpenURL(twitterUrl);
      if (supported) {
        await Linking.openURL(twitterUrl);
      } else {
        // Fallback to general share
        await Share.share({
          message: text,
          url: content.shareUrl,
        });
      }
    } catch (error) {
      console.error('Error sharing to Twitter:', error);
      Alert.alert('Error', 'Failed to share to Twitter. Please try again.');
    }
  }

  private static async shareToFacebook(text: string, content: ShareableContent) {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(content.shareUrl || '')}&quote=${encodeURIComponent(text)}`;
    
    try {
      const supported = await Linking.canOpenURL(facebookUrl);
      if (supported) {
        await Linking.openURL(facebookUrl);
      } else {
        // Fallback to general share
        await Share.share({
          message: text,
          url: content.shareUrl,
        });
      }
    } catch (error) {
      console.error('Error sharing to Facebook:', error);
      Alert.alert('Error', 'Failed to share to Facebook. Please try again.');
    }
  }

  private static getResultEmoji(result: string): string {
    switch (result) {
      case 'safe': return '✅';
      case 'caution': return '⚠️';
      case 'avoid': return '❌';
      default: return '📱';
    }
  }

  private static formatDate(date?: Date): string {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }

  static async shareWithOptions(content: ShareableContent) {
    Alert.alert(
      'Share Options',
      'Choose how you\'d like to share this content:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'General Share', onPress: () => this.shareContent(content) },
        { text: 'Twitter', onPress: () => this.shareToSocialMedia(content, 'twitter') },
        { text: 'Facebook', onPress: () => this.shareToSocialMedia(content, 'facebook') },
        { text: 'Instagram', onPress: () => this.shareToSocialMedia(content, 'instagram') },
      ]
    );
  }
}
