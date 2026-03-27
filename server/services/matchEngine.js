const stringSimilarity = require('string-similarity');
const Item = require('../models/Item');
const Notification = require('../models/Notification');

const MATCH_THRESHOLD = 0.75; // 75% raw similarity -> tuned for 90% display

function calcNameScore(a, b) {
  return stringSimilarity.compareTwoStrings(a.toLowerCase(), b.toLowerCase());
}

function calcLocationScore(a, b) {
  return stringSimilarity.compareTwoStrings(a.toLowerCase(), b.toLowerCase());
}

function calcTimeScore(dateA, dateB) {
  const diffDays = Math.abs((new Date(dateA) - new Date(dateB)) / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return 1.0;
  if (diffDays < 3) return 0.8;
  if (diffDays < 7) return 0.6;
  if (diffDays < 14) return 0.3;
  return 0.1;
}

function calcAttrScore(lostItem, foundItem) {
  let score = 0, total = 0;
  if (lostItem.brand && foundItem.brand) {
    total++;
    if (lostItem.brand.toLowerCase() === foundItem.brand.toLowerCase()) score++;
  }
  if (lostItem.colour && foundItem.colour) {
    total++;
    if (lostItem.colour.toLowerCase() === foundItem.colour.toLowerCase()) score++;
  }
  if (lostItem.size && foundItem.size) {
    total++;
    if (lostItem.size.toLowerCase() === foundItem.size.toLowerCase()) score++;
  }
  return total === 0 ? 0.5 : score / total;
}

async function findMatches(newItem) {
  const oppositeType = newItem.type === 'lost' ? 'found' : 'lost';
  const candidates = await Item.find({ type: oppositeType, status: { $nin: ['returned', 'matched'] }, isActive: true });

  const matches = [];
  for (const candidate of candidates) {
    const lostItem = newItem.type === 'lost' ? newItem : candidate;
    const foundItem = newItem.type === 'found' ? newItem : candidate;

    const nameScore = calcNameScore(lostItem.name, foundItem.name);
    const locScore = calcLocationScore(lostItem.location, foundItem.location);
    const timeScore = calcTimeScore(lostItem.dateTime, foundItem.dateTime);
    const attrScore = calcAttrScore(lostItem, foundItem);

    const totalScore = nameScore * 0.35 + locScore * 0.25 + timeScore * 0.20 + attrScore * 0.20;

    if (totalScore >= MATCH_THRESHOLD) {
      matches.push({ item: candidate, score: Math.round(totalScore * 100) });
    }
  }

  matches.sort((a, b) => b.score - a.score);
  return matches;
}

async function processMatches(newItem) {
  const matches = await findMatches(newItem);
  if (matches.length === 0) return;

  const bestMatch = matches[0];
  const lostItem = newItem.type === 'lost' ? newItem : bestMatch.item;
  const foundItem = newItem.type === 'found' ? newItem : bestMatch.item;

  // Update statuses
  await Item.findByIdAndUpdate(lostItem._id, {
    status: 'matched', matchedWith: foundItem._id, matchScore: bestMatch.score
  });
  await Item.findByIdAndUpdate(foundItem._id, {
    status: 'matched', matchedWith: lostItem._id, matchScore: bestMatch.score
  });

  // Populate reporters
  const lostPopulated = await Item.findById(lostItem._id).populate('reportedBy');
  const foundPopulated = await Item.findById(foundItem._id).populate('reportedBy');

  // Create notifications
  const notifForLost = await Notification.create({
    recipient: lostPopulated.reportedBy._id,
    sender: foundPopulated.reportedBy._id,
    type: 'match_found',
    title: '🎉 Your item may have been found!',
    message: `Your lost "${lostItem.name}" has a ${bestMatch.score}% match with a found item at ${foundItem.location}. Connect with the finder!`,
    relatedItem: lostItem._id,
    matchedItem: foundItem._id
  });

  const notifForFound = await Notification.create({
    recipient: foundPopulated.reportedBy._id,
    sender: lostPopulated.reportedBy._id,
    type: 'match_found',
    title: '🔍 A match was found for your reported item!',
    message: `The item "${foundItem.name}" you found may belong to someone who reported it lost. Help them get it back!`,
    relatedItem: foundItem._id,
    matchedItem: lostItem._id
  });

  // Push real-time via socket
  const io = global.io;
  const connectedUsers = global.connectedUsers;
  if (io && connectedUsers) {
    const lostSocketId = connectedUsers.get(lostPopulated.reportedBy._id.toString());
    const foundSocketId = connectedUsers.get(foundPopulated.reportedBy._id.toString());
    if (lostSocketId) io.to(lostSocketId).emit('notification', notifForLost);
    if (foundSocketId) io.to(foundSocketId).emit('notification', notifForFound);
  }
}

module.exports = { processMatches, findMatches };
